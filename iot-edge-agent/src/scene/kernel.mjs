/**
 * Scene Kernel: manual / policy / AI share one command pipeline.
 * Interlocks and evidence fail closed. Cloud outage does not disable local policy.
 */

const MODE_SOURCES = {
  manual: new Set(["user"]),
  policy: new Set(["user", "policy"]),
  ai: new Set(["user", "policy", "ai"]),
};

const ON_COMMANDS = new Set([
  "open",
  "setPosition",
  "relayOn",
  "zoneOn",
  "pumpOn",
  "aeratorOn",
  "sprayOn",
  "setFan",
]);

const OFF_COMMANDS = new Set([
  "close",
  "stop",
  "relayOff",
  "zoneOff",
  "pumpOff",
  "aeratorOff",
  "sprayOff",
]);

export function compare(op, left, right) {
  if (op === "lt") return left < right;
  if (op === "lte") return left <= right;
  if (op === "gt") return left > right;
  if (op === "gte") return left >= right;
  return left === right;
}

export function matchesWhen(when, telemetry) {
  if (!when || typeof when !== "object") return false;
  for (const [key, spec] of Object.entries(when)) {
    const actual = telemetry?.[key];
    if (spec && typeof spec === "object" && !Array.isArray(spec)) {
      const [[op, expected]] = Object.entries(spec);
      if (typeof actual !== "number" || !compare(op, actual, expected)) return false;
    } else if (actual !== spec) {
      return false;
    }
  }
  return true;
}

export function triggerHits(triggers = [], telemetry, source) {
  if (!triggers.length) return source === "user";
  return triggers.some((trigger) => {
    if (trigger.type === "command") return source === "user";
    if (trigger.type === "ai") return source === "ai";
    if (trigger.type === "schedule") {
      return source === "policy" && Number(telemetry.in_window ?? telemetry.inWindow) === 1;
    }
    if (trigger.type === "threshold") {
      const actual = telemetry?.[trigger.key];
      if (actual === undefined || actual === null) return false;
      return compare(trigger.op ?? "eq", actual, trigger.value);
    }
    if (trigger.type === "external_event") {
      if (source !== "policy") return false;
      if (trigger.source && telemetry?.external_source !== trigger.source) return false;
      if (trigger.schema && telemetry?.external_schema !== trigger.schema) return false;
      if (trigger.kind && telemetry?.external_kind !== trigger.kind) return false;
      if (trigger.state && telemetry?.external_state !== trigger.state) return false;
      return true;
    }
    return false;
  });
}

function deny(reason, extra = {}) {
  return { decision: "deny", reason, ...extra };
}

export function evaluateScene({
  scene,
  kit,
  telemetry = {},
  intent,
  killSwitch = false,
  onDurationSec = 0,
} = {}) {
  if (!scene) return deny("NO_SCENE");
  if (killSwitch) return deny("KILL_SWITCH");

  const source = intent?.source ?? (scene.mode === "manual" ? "user" : scene.mode);
  const allowedSources = MODE_SOURCES[scene.mode] ?? MODE_SOURCES.manual;
  if (!allowedSources.has(source)) return deny("MODE");

  const commandId = intent?.commandId ?? scene.actions?.[0]?.commandId;
  const params = { ...(scene.actions?.[0]?.params ?? {}), ...(intent?.params ?? {}) };

  if (!intent?.commandId && !triggerHits(scene.triggers, telemetry, source)) {
    return { decision: "hold", reason: "NO_TRIGGER" };
  }

  if (!commandId) return { decision: "hold", reason: "NO_ACTION" };

  const kitAllow = kit?.safetyEnvelope?.allowlist ?? kit?.commands?.map((cmd) => cmd.id) ?? [];
  if (kitAllow.length && !kitAllow.includes(commandId)) return deny("NOT_ALLOWLISTED");
  const cmd = (kit?.commands ?? []).find((row) => row.id === commandId);
  if (kit?.commands?.length && !cmd) return deny("NOT_ALLOWLISTED");

  const rangeKey = (cmd?.params ?? []).find((name) => ["pct", "zone", "ch"].includes(name));
  const numeric = rangeKey ? params[rangeKey] : params.pct;
  if (cmd?.min != null && numeric != null && (numeric < cmd.min || numeric > cmd.max)) {
    return deny("OUT_OF_RANGE");
  }

  if (source === "ai") {
    const keys = [
      ...new Set([
        ...(scene.safety?.requireEvidence ?? []),
        ...(kit?.safetyEnvelope?.requireEvidence ?? []),
      ]),
    ];
    for (const key of keys) {
      if (telemetry[key] === undefined || telemetry[key] === null) return deny("EVIDENCE");
    }
  }

  const interlocks = [
    ...(kit?.safetyEnvelope?.interlocks ?? []),
    ...(scene.safety?.interlocks ?? []),
  ];
  for (const lock of interlocks) {
    if (matchesWhen(lock.when, telemetry) && (lock.deny ?? []).includes(commandId)) {
      return deny("INTERLOCK");
    }
  }

  const dryRunSec = scene.safety?.dryRunSec ?? kit?.safetyEnvelope?.dryRunSec;
  if (
    dryRunSec != null &&
    ON_COMMANDS.has(commandId) &&
    telemetry.flow_lpm === 0 &&
    onDurationSec >= dryRunSec
  ) {
    return deny("DRY_RUN");
  }

  const maxOn = scene.safety?.maxOnSec ?? kit?.safetyEnvelope?.maxOnSec;
  if (maxOn != null && ON_COMMANDS.has(commandId) && onDurationSec > maxOn) {
    return deny("MAX_ON");
  }

  return {
    decision: "dispatch",
    commandId,
    params,
    source,
    method: cmd?.method ?? commandId,
  };
}

/** Prefer fail-closed and off commands when multiple scenes fire. */
export function pickSceneDecision(results = []) {
  const hard = results.find(
    (row) => row?.decision === "deny" && ["KILL_SWITCH", "DRY_RUN"].includes(row.reason),
  );
  if (hard) return hard;
  const off = results.find((row) => row?.decision === "dispatch" && OFF_COMMANDS.has(row.commandId));
  if (off) return off;
  const interlock = results.find((row) => row?.decision === "deny" && row.reason === "INTERLOCK");
  if (interlock) return interlock;
  return (
    results.find((row) => row?.decision === "dispatch") ??
    results.find((row) => row?.decision === "hold") ??
    results[0] ??
    deny("NO_SCENE")
  );
}
