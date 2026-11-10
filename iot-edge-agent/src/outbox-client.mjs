/**
 * HTTP client for the Gateway command outbox.
 *
 * Live routes (Nest global prefix `api/v1`, OpenAPI server
 * `http://localhost:13200/api/v1`, paths `/edge/commands` and
 * `/edge/commands/receipt`):
 *   GET  {apiRoot}/edge/commands
 *   POST {apiRoot}/edge/commands/receipt
 * `GATEWAY_BASE_URL` may be the origin (`http://127.0.0.1:13200`) or an API
 * root that already ends with `/api/v1`.
 *
 * Gateway contract this client follows. iot-gateway is unchanged:
 * - `GET edge/commands` calls `CommandService.pullPending()` with no node
 *   argument, so every pending `command.dispatch` row is returned.
 *   `EDGE_NODE_ID` is sent as `X-Edge-Node-Id` and copied to `detail.nodeId`.
 * - `POST edge/commands/receipt` reads `outboxId`, `commandRowId`, `status`,
 *   and `detail`. `ackReceipt` stores `status` on the receipt JSON.
 *   `completeOutbox` still sets the command row to `dispatched` when the
 *   posted status is `Rejected`.
 * - A successful pull increments outbox `attempts` (the row is marked dead
 *   after 8). Receipts are posted for every executed command.
 * - `TB_MODE=fake` or `EDGE_INLINE_DISPATCH=true` completes the outbox inside
 *   `dispatch`, so this pull stays empty.
 * Both routes require `Authorization: Bearer` and `iot.device:control`
 * (`GATEWAY_BEARER_TOKEN`).
 */

const DEFAULT_POLL_MS = 5000;
const DEFAULT_TIMEOUT_MS = 8000;
const DEFAULT_NODE_ID = "edge-1";

export function resolveApiRoot(baseUrl) {
  const trimmed = String(baseUrl ?? "").trim().replace(/\/+$/, "");
  if (/\/api\/v1$/i.test(trimmed)) return trimmed;
  return `${trimmed}/api/v1`;
}

function positiveInt(value, fallback) {
  if (value == null || String(value).trim() === "") return fallback;
  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) return fallback;
  return n;
}

export function readOutboxConfig(env = process.env, defaults = {}) {
  const baseUrl = String(env.GATEWAY_BASE_URL ?? "").trim();
  if (!baseUrl) return { enabled: false, mode: "sim" };
  const nodeId =
    String(env.EDGE_NODE_ID ?? defaults.nodeId ?? DEFAULT_NODE_ID).trim() || DEFAULT_NODE_ID;
  return {
    enabled: true,
    mode: "live",
    baseUrl: baseUrl.replace(/\/+$/, ""),
    apiRoot: resolveApiRoot(baseUrl),
    nodeId,
    pollMs: positiveInt(env.EDGE_OUTBOX_POLL_MS, DEFAULT_POLL_MS),
    timeoutMs: positiveInt(env.EDGE_OUTBOX_TIMEOUT_MS, DEFAULT_TIMEOUT_MS),
    token: String(env.GATEWAY_BEARER_TOKEN ?? "").trim(),
  };
}

export function toReceiptBody(command, receipt, nodeId) {
  const source = receipt && typeof receipt === "object" ? receipt : {};
  const status = typeof source.status === "string" && source.status.trim() ? source.status : "Rejected";
  const detail = {};
  for (const [key, value] of Object.entries(source)) {
    if (key === "outboxId" || key === "commandRowId" || key === "status") continue;
    if (value === undefined) continue;
    detail[key] = value;
  }
  if (nodeId) detail.nodeId = nodeId;
  const outboxId = source.outboxId ?? command?.outboxId;
  const commandRowId = source.commandRowId ?? command?.commandRowId;
  const body = { outboxId, status };
  if (commandRowId) body.commandRowId = commandRowId;
  if (Object.keys(detail).length) body.detail = detail;
  return body;
}

function messageOf(err) {
  if (err instanceof Error) return err.message;
  return String(err);
}

function authorizationHeader(token) {
  if (!token) return undefined;
  return /^Bearer\s+/i.test(token) ? token : `Bearer ${token}`;
}

function buildHeaders(config, json) {
  const headers = {
    accept: "application/json",
    "x-edge-node-id": config.nodeId,
  };
  if (json) headers["content-type"] = "application/json";
  const authorization = authorizationHeader(config.token);
  if (authorization) headers.authorization = authorization;
  return headers;
}

async function requestJson(fetchImpl, url, { method, headers, body, timeoutMs }) {
  const res = await fetchImpl(url, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });
  const text = await res.text();
  let parsed = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text.slice(0, 500);
    }
  }
  return { ok: res.ok, status: res.status, body: parsed };
}

function defaultLog(event) {
  console.error(JSON.stringify({ service: "iot-edge-agent", ...event }));
}

function isCommand(row) {
  return Boolean(
    row &&
      typeof row === "object" &&
      !Array.isArray(row) &&
      typeof row.outboxId === "string" &&
      row.outboxId,
  );
}

export function createOutboxClient({
  agent,
  config,
  fetchImpl = globalThis.fetch,
  execute,
  log = defaultLog,
  schedule = (fn, ms) => setInterval(fn, ms),
  clear = (timer) => clearInterval(timer),
} = {}) {
  if (!agent || typeof agent.consumeOutbox !== "function") {
    throw new Error("outbox client requires an agent");
  }
  const resolved = config ?? readOutboxConfig();
  let timer = null;
  let started = false;
  let inFlight = false;
  let current = Promise.resolve();

  function wrappedExecute(cmd) {
    if (!execute) return { status: "Accepted" };
    try {
      const result = execute(cmd);
      if (!result || typeof result !== "object") {
        return { status: "Rejected", reason: "BAD_EXECUTE_RESULT" };
      }
      return result;
    } catch {
      return { status: "Rejected", reason: "EXECUTE_FAILED" };
    }
  }

  async function pullAndReceipt() {
    const commandsUrl = `${resolved.apiRoot}/edge/commands`;
    let pulled;
    try {
      pulled = await requestJson(fetchImpl, commandsUrl, {
        method: "GET",
        headers: buildHeaders(resolved, false),
        timeoutMs: resolved.timeoutMs,
      });
    } catch (err) {
      log({ event: "outbox_pull_failed", error: messageOf(err) });
      return {
        ok: false,
        mode: "live",
        error: "pull_failed",
        message: messageOf(err),
        pulled: 0,
        receipts: [],
      };
    }
    if (!pulled.ok) {
      log({ event: "outbox_pull_failed", httpStatus: pulled.status });
      return {
        ok: false,
        mode: "live",
        error: "pull_failed",
        httpStatus: pulled.status,
        pulled: 0,
        receipts: [],
      };
    }
    if (!Array.isArray(pulled.body)) {
      log({ event: "outbox_pull_failed", error: "unexpected_body" });
      return { ok: false, mode: "live", error: "unexpected_body", pulled: 0, receipts: [] };
    }

    const commands = pulled.body.filter(isCommand);
    const executed = agent.consumeOutbox(commands, wrappedExecute);
    const receipts = [];
    for (let i = 0; i < executed.length; i += 1) {
      const body = toReceiptBody(commands[i], executed[i], resolved.nodeId);
      if (!body.outboxId) {
        receipts.push({ ok: false, error: "missing_outbox_id", status: body.status });
        continue;
      }
      try {
        const posted = await requestJson(fetchImpl, `${resolved.apiRoot}/edge/commands/receipt`, {
          method: "POST",
          headers: buildHeaders(resolved, true),
          body,
          timeoutMs: resolved.timeoutMs,
        });
        if (!posted.ok) {
          log({
            event: "outbox_receipt_failed",
            outboxId: body.outboxId,
            httpStatus: posted.status,
          });
        }
        receipts.push({
          ok: posted.ok,
          httpStatus: posted.status,
          outboxId: body.outboxId,
          status: body.status,
          ...(posted.ok ? {} : { error: "receipt_failed" }),
        });
      } catch (err) {
        log({
          event: "outbox_receipt_failed",
          outboxId: body.outboxId,
          error: messageOf(err),
        });
        receipts.push({
          ok: false,
          error: "receipt_failed",
          outboxId: body.outboxId,
          status: body.status,
          message: messageOf(err),
        });
      }
    }
    return {
      ok: receipts.every((row) => row.ok),
      mode: "live",
      pulled: commands.length,
      receipts,
    };
  }

  function pollOnce() {
    if (!resolved.enabled) {
      return Promise.resolve({ ok: true, mode: "sim", pulled: 0, receipts: [] });
    }
    if (inFlight) {
      return Promise.resolve({
        ok: true,
        mode: "live",
        skipped: true,
        pulled: 0,
        receipts: [],
      });
    }
    inFlight = true;
    const run = pullAndReceipt()
      .catch((err) => {
        log({ event: "outbox_poll_failed", error: messageOf(err) });
        return {
          ok: false,
          mode: "live",
          error: "pull_failed",
          message: messageOf(err),
          pulled: 0,
          receipts: [],
        };
      })
      .finally(() => {
        inFlight = false;
      });
    current = run;
    return run;
  }

  function stop() {
    started = false;
    if (timer != null) clear(timer);
    timer = null;
  }

  function start() {
    if (!resolved.enabled) return stop;
    if (started) return stop;
    started = true;
    timer = schedule(() => {
      pollOnce();
    }, resolved.pollMs);
    pollOnce();
    return stop;
  }

  return {
    config: publicConfig(resolved),
    pollOnce,
    start,
    stop,
    whenIdle: () => current,
  };
}

function publicConfig(config) {
  if (!config.enabled) return { enabled: false, mode: "sim" };
  return {
    enabled: true,
    mode: "live",
    baseUrl: config.baseUrl,
    apiRoot: config.apiRoot,
    nodeId: config.nodeId,
    pollMs: config.pollMs,
    timeoutMs: config.timeoutMs,
    hasToken: Boolean(config.token),
  };
}

export function startOutboxFromEnv(agent, env = process.env, hooks = {}) {
  const config = readOutboxConfig(env, { nodeId: agent?.identity?.nodeId });
  if (!config.enabled) return { enabled: false, mode: "sim", stop() {} };
  const client = createOutboxClient({
    agent,
    config,
    fetchImpl: hooks.fetchImpl,
    execute: hooks.execute,
    log: hooks.log,
    schedule: hooks.schedule,
    clear: hooks.clear,
  });
  const stop = client.start();
  return {
    enabled: true,
    mode: "live",
    nodeId: config.nodeId,
    pollMs: config.pollMs,
    apiRoot: config.apiRoot,
    stop,
    whenIdle: () => client.whenIdle(),
    client,
  };
}
