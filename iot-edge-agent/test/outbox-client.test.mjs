import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createAgent } from "../src/agent.mjs";
import { main } from "../src/index.mjs";
import {
  createOutboxClient,
  readOutboxConfig,
  resolveApiRoot,
  startOutboxFromEnv,
  toReceiptBody,
} from "../src/outbox-client.mjs";

function jsonResponse(body, status = 200) {
  const payload = typeof body === "string" ? body : JSON.stringify(body);
  return new Response(payload, {
    status,
    headers: { "content-type": "application/json" },
  });
}

function liveConfig(extra = {}) {
  return readOutboxConfig({
    GATEWAY_BASE_URL: "http://127.0.0.1:13200",
    EDGE_NODE_ID: "edge-lab",
    EDGE_OUTBOX_POLL_MS: "5000",
    ...extra,
  });
}

function clientFor(agent, fetchImpl, extra = {}) {
  return createOutboxClient({
    agent,
    config: extra.config ?? liveConfig(extra.env),
    fetchImpl,
    execute: extra.execute,
    log: extra.log ?? (() => {}),
    schedule: extra.schedule,
    clear: extra.clear,
  });
}

describe("edge outbox http client", () => {
  it("stays in sim mode when GATEWAY_BASE_URL is unset", async () => {
    assert.deepEqual(readOutboxConfig({}), { enabled: false, mode: "sim" });
    assert.equal(readOutboxConfig({ GATEWAY_BASE_URL: "   " }).mode, "sim");
    let called = false;
    const fetchImpl = async () => {
      called = true;
      throw new Error("fetch should not run");
    };
    const agent = createAgent();
    const started = startOutboxFromEnv(agent, {}, { fetchImpl });
    assert.equal(started.enabled, false);
    assert.equal(started.mode, "sim");
    const polled = await clientFor(agent, fetchImpl, {
      config: readOutboxConfig({ EDGE_NODE_ID: "edge-lab" }),
    }).pollOnce();
    assert.deepEqual(polled, { ok: true, mode: "sim", pulled: 0, receipts: [] });
    assert.equal(called, false);
  });

  it("resolves the gateway API root with or without /api/v1", () => {
    assert.equal(resolveApiRoot("http://127.0.0.1:13200"), "http://127.0.0.1:13200/api/v1");
    assert.equal(resolveApiRoot("http://127.0.0.1:13200/"), "http://127.0.0.1:13200/api/v1");
    assert.equal(
      resolveApiRoot("http://127.0.0.1:13200/api/v1"),
      "http://127.0.0.1:13200/api/v1",
    );
    assert.equal(
      resolveApiRoot("http://127.0.0.1:13200/api/v1/"),
      "http://127.0.0.1:13200/api/v1",
    );
    assert.equal(
      resolveApiRoot("https://example.com/syncrobrain"),
      "https://example.com/syncrobrain/api/v1",
    );
  });

  it("uses poll interval, node id, and bearer token from env", () => {
    const config = readOutboxConfig({
      GATEWAY_BASE_URL: "http://127.0.0.1:13200/api/v1/",
      EDGE_NODE_ID: " node-a ",
      EDGE_OUTBOX_POLL_MS: "2500",
      EDGE_OUTBOX_TIMEOUT_MS: "1500",
      GATEWAY_BEARER_TOKEN: "tok-1",
    });
    assert.equal(config.mode, "live");
    assert.equal(config.apiRoot, "http://127.0.0.1:13200/api/v1");
    assert.equal(config.nodeId, "node-a");
    assert.equal(config.pollMs, 2500);
    assert.equal(config.timeoutMs, 1500);
    assert.equal(config.token, "tok-1");
    assert.equal(
      readOutboxConfig({ GATEWAY_BASE_URL: "http://127.0.0.1:13200", EDGE_OUTBOX_POLL_MS: "0" }).pollMs,
      5000,
    );
    assert.equal(
      readOutboxConfig({ GATEWAY_BASE_URL: "http://127.0.0.1:13200", EDGE_OUTBOX_POLL_MS: "nope" })
        .pollMs,
      5000,
    );
  });

  it("pulls commands, executes them, and posts receipts", async () => {
    const calls = [];
    const seen = [];
    const agent = createAgent({ nodeId: "edge-lab" });
    const outbox = clientFor(agent, async (url, init) => {
      calls.push({ url: String(url), init });
      if (init.method === "GET") {
        return jsonResponse([
          { outboxId: "ob-1", commandRowId: "c1", commandId: "ping", assetId: "a1" },
          { commandId: "skip-me" },
          null,
          { outboxId: "ob-2", commandRowId: "c2", commandId: "setPowerKw" },
        ]);
      }
      return jsonResponse({ ok: true }, 200);
    }, {
      execute(cmd) {
        seen.push(cmd.commandId);
        if (cmd.commandId === "setPowerKw") return { status: "Rejected", reason: "NOT_ALLOWLISTED" };
        return { status: "Accepted" };
      },
    });

    const result = await outbox.pollOnce();
    assert.equal(result.ok, true);
    assert.equal(result.pulled, 2);
    assert.deepEqual(seen, ["ping", "setPowerKw"]);
    assert.deepEqual(
      result.receipts.map((row) => ({ outboxId: row.outboxId, status: row.status, ok: row.ok })),
      [
        { outboxId: "ob-1", status: "Accepted", ok: true },
        { outboxId: "ob-2", status: "Rejected", ok: true },
      ],
    );

    const get = calls[0];
    assert.equal(get.url, "http://127.0.0.1:13200/api/v1/edge/commands");
    assert.equal(get.init.method, "GET");
    assert.equal(get.init.headers["x-edge-node-id"], "edge-lab");
    assert.equal(get.init.headers["content-type"], undefined);
    assert.equal(get.init.body, undefined);
    assert.ok(get.init.signal instanceof AbortSignal);

    assert.equal(calls[1].url, "http://127.0.0.1:13200/api/v1/edge/commands/receipt");
    assert.deepEqual(JSON.parse(calls[1].init.body), {
      outboxId: "ob-1",
      commandRowId: "c1",
      status: "Accepted",
      detail: { nodeId: "edge-lab" },
    });
    assert.equal(calls[1].init.headers["content-type"], "application/json");
    assert.deepEqual(JSON.parse(calls[2].init.body), {
      outboxId: "ob-2",
      commandRowId: "c2",
      status: "Rejected",
      detail: { reason: "NOT_ALLOWLISTED", nodeId: "edge-lab" },
    });
  });

  it("posts Rejected receipts from the kill switch without executing", async () => {
    const calls = [];
    let executed = 0;
    const agent = createAgent({ killSwitch: true, nodeId: "edge-lab" });
    const outbox = clientFor(
      agent,
      async (url, init) => {
        calls.push({ url: String(url), body: init.body, headers: init.headers });
        if (init.method === "GET") {
          return jsonResponse([
            { outboxId: "ob-k", commandRowId: "c-k", commandId: "remoteStop" },
          ]);
        }
        return jsonResponse({ id: "c-k" });
      },
      {
        env: { GATEWAY_BEARER_TOKEN: "Bearer already" },
        execute() {
          executed += 1;
          return { status: "Accepted" };
        },
      },
    );

    const result = await outbox.pollOnce();
    assert.equal(executed, 0);
    assert.equal(result.receipts[0].status, "Rejected");
    assert.equal(calls[0].headers.authorization, "Bearer already");
    assert.deepEqual(JSON.parse(calls[1].body), {
      outboxId: "ob-k",
      commandRowId: "c-k",
      status: "Rejected",
      detail: { reason: "KILL_SWITCH", nodeId: "edge-lab" },
    });
  });

  it("sends a bearer token and keeps it off the public config", async () => {
    const calls = [];
    const outbox = clientFor(
      createAgent(),
      async (_url, init) => {
        calls.push(init.headers.authorization);
        return jsonResponse([]);
      },
      { env: { GATEWAY_BEARER_TOKEN: "secret-token" } },
    );
    await outbox.pollOnce();
    assert.equal(calls[0], "Bearer secret-token");
    assert.equal(outbox.config.hasToken, true);
    assert.equal(JSON.stringify(outbox.config).includes("secret-token"), false);
  });

  it("uses global fetch when no fetchImpl is injected", async () => {
    const original = globalThis.fetch;
    const seen = [];
    globalThis.fetch = async (url) => {
      seen.push(String(url));
      return jsonResponse([]);
    };
    try {
      const outbox = createOutboxClient({
        agent: createAgent(),
        config: liveConfig(),
        log() {},
      });
      const result = await outbox.pollOnce();
      assert.equal(result.ok, true);
      assert.equal(result.pulled, 0);
      assert.deepEqual(seen, ["http://127.0.0.1:13200/api/v1/edge/commands"]);
    } finally {
      globalThis.fetch = original;
    }
  });

  it("does not post receipts when the pull fails or the body is not an array", async () => {
    const posts = [];
    const httpFail = clientFor(
      createAgent(),
      async (_url, init) => {
        if (init.method === "POST") posts.push("posted");
        return jsonResponse({ message: "nope" }, 503);
      },
    );
    const failed = await httpFail.pollOnce();
    assert.equal(failed.ok, false);
    assert.equal(failed.error, "pull_failed");
    assert.equal(failed.httpStatus, 503);
    assert.deepEqual(posts, []);

    const weird = clientFor(createAgent(), async () => jsonResponse({ commands: [] }));
    const unexpected = await weird.pollOnce();
    assert.equal(unexpected.error, "unexpected_body");
    assert.equal(unexpected.pulled, 0);
  });

  it("continues later receipts when one post fails and when execute throws", async () => {
    const calls = [];
    const outbox = clientFor(
      createAgent(),
      async (url, init) => {
        calls.push(init.method);
        if (init.method === "GET") {
          return jsonResponse([
            { outboxId: "ob-a", commandRowId: "a", commandId: "ping" },
            { outboxId: "ob-b", commandRowId: "b", commandId: "ping" },
          ]);
        }
        const body = JSON.parse(init.body);
        if (body.outboxId === "ob-a") return jsonResponse({ message: "bad" }, 409);
        return jsonResponse({ ok: true });
      },
      {
        execute(cmd) {
          if (cmd.outboxId === "ob-b") throw new Error("boom");
          return { status: "Accepted" };
        },
      },
    );
    const result = await outbox.pollOnce();
    assert.equal(result.ok, false);
    assert.deepEqual(
      result.receipts.map((row) => ({ outboxId: row.outboxId, status: row.status, error: row.error })),
      [
        { outboxId: "ob-a", status: "Accepted", error: "receipt_failed" },
        { outboxId: "ob-b", status: "Rejected", error: undefined },
      ],
    );
    assert.deepEqual(calls, ["GET", "POST", "POST"]);
  });

  it("reports pull_failed when the request times out", async () => {
    const outbox = createOutboxClient({
      agent: createAgent(),
      config: { ...liveConfig(), timeoutMs: 20 },
      log() {},
      fetchImpl: (_url, init) =>
        new Promise((_resolve, reject) => {
          init.signal.addEventListener("abort", () => {
            reject(init.signal.reason ?? new Error("timeout"));
          });
        }),
    });
    const result = await outbox.pollOnce();
    assert.equal(result.ok, false);
    assert.equal(result.error, "pull_failed");
    assert.equal(result.receipts.length, 0);
  });

  it("skips an overlapping poll until the in-flight one finishes", async () => {
    let release;
    const gate = new Promise((resolve) => {
      release = resolve;
    });
    let pulls = 0;
    const outbox = clientFor(createAgent(), async () => {
      pulls += 1;
      await gate;
      return jsonResponse([]);
    });
    const first = outbox.pollOnce();
    const second = await outbox.pollOnce();
    assert.equal(second.skipped, true);
    assert.equal(pulls, 1);
    let idleDone = false;
    const idle = outbox.whenIdle().then(() => {
      idleDone = true;
    });
    await Promise.resolve();
    assert.equal(idleDone, false);
    release();
    const finished = await first;
    await idle;
    assert.equal(finished.ok, true);
    assert.equal(idleDone, true);
  });

  it("schedules polls from EDGE_OUTBOX_POLL_MS and stop clears the timer", async () => {
    let scheduled = null;
    let cleared = null;
    const outbox = clientFor(createAgent(), async () => jsonResponse([]), {
      env: { EDGE_OUTBOX_POLL_MS: "2500" },
      schedule(fn, ms) {
        scheduled = { fn, ms };
        return { id: "timer-1" };
      },
      clear(timer) {
        cleared = timer;
      },
    });
    const stop = outbox.start();
    assert.equal(scheduled.ms, 2500);
    await outbox.whenIdle();
    outbox.start();
    assert.equal(cleared, null);
    stop();
    assert.deepEqual(cleared, { id: "timer-1" });
    scheduled.fn();
    const skippedOrDone = await outbox.whenIdle();
    assert.equal(skippedOrDone.mode, "live");
  });

  it("builds a receipt body with outboxId and status", () => {
    assert.deepEqual(
      toReceiptBody(
        { outboxId: "ob-1", commandRowId: "c1" },
        { outboxId: "ob-1", status: "Rejected", reason: "KILL_SWITCH" },
        "edge-lab",
      ),
      {
        outboxId: "ob-1",
        commandRowId: "c1",
        status: "Rejected",
        detail: { reason: "KILL_SWITCH", nodeId: "edge-lab" },
      },
    );
    assert.equal(toReceiptBody({}, {}, "").status, "Rejected");
    assert.equal(toReceiptBody({}, {}).outboxId, undefined);
  });

  it("main stays sim-only without GATEWAY_BASE_URL and polls when it is set", async () => {
    let called = false;
    const sim = main({}, {
      fetchImpl: async () => {
        called = true;
        return jsonResponse([]);
      },
    });
    assert.equal(called, false);
    assert.equal(sim.outbox.mode, "sim");
    assert.equal(sim.status.outbox, undefined);
    assert.equal(sim.status.service, "iot-edge-agent");
    assert.equal(sim.status.status, "ok");
    assert.equal(sim.agent.identity.nodeId, "edge-1");

    const calls = [];
    const live = main(
      {
        GATEWAY_BASE_URL: "http://127.0.0.1:13200",
        EDGE_NODE_ID: "edge-live",
        EDGE_KILL_SWITCH: "true",
        EDGE_OUTBOX_POLL_MS: "60000",
        GATEWAY_BEARER_TOKEN: "secret-token",
      },
      {
        log() {},
        schedule() {
          return { id: "t" };
        },
        clear() {},
        fetchImpl: async (url, init) => {
          calls.push({ url: String(url), method: init.method, body: init.body, authorization: init.headers.authorization });
          if (init.method === "GET") {
            return jsonResponse([{ outboxId: "ob-live", commandRowId: "row-1", commandId: "ping" }]);
          }
          return jsonResponse({ ok: true });
        },
      },
    );
    try {
      assert.equal(live.status.outbox, "polling");
      assert.equal(live.status.nodeId, "edge-live");
      assert.equal(JSON.stringify(live.status).includes("secret-token"), false);
      await live.outbox.whenIdle();
      assert.equal(calls[0].url, "http://127.0.0.1:13200/api/v1/edge/commands");
      assert.equal(calls[0].authorization, "Bearer secret-token");
      assert.equal(calls[1].method, "POST");
      assert.deepEqual(JSON.parse(calls[1].body), {
        outboxId: "ob-live",
        commandRowId: "row-1",
        status: "Rejected",
        detail: { reason: "KILL_SWITCH", nodeId: "edge-live" },
      });
    } finally {
      live.outbox.stop();
    }
  });
});
