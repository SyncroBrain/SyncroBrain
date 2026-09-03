/**
 * ESP32 public-kit mapping onto ThingsBoard MQTT telemetry / RPC.
 * Does not invent a second production topic.
 */

export function mapEsp32Telemetry(raw, kit) {
  if (!kit) throw new Error("esp32-mqtt: kit required");
  const telemetry = {};
  for (const ch of kit.channels ?? []) {
    if (raw?.[ch.key] !== undefined) telemetry[ch.key] = raw[ch.key];
  }
  const missing = (kit.channels ?? [])
    .filter((ch) => ch.required && telemetry[ch.key] === undefined)
    .map((ch) => ch.key);
  return {
    protocol: "esp32-mqtt",
    kitSlug: kit.slug,
    schemaVersion: "1",
    channelId: kit.slug,
    eventTime: raw?.eventTime ?? new Date().toISOString(),
    value: telemetry,
    quality: missing.length ? "unmapped" : "ok",
    missing,
  };
}

export function mapEsp32Command(intent, kit) {
  if (!intent?.commandId) return { status: "Rejected", reason: "MISSING_COMMAND" };
  const cmd = (kit?.commands ?? []).find((row) => row.id === intent.commandId);
  if (!cmd) return { status: "Rejected", reason: "NOT_ALLOWLISTED" };
  const allow = kit?.safetyEnvelope?.allowlist;
  if (allow?.length && !allow.includes(intent.commandId)) {
    return { status: "Rejected", reason: "NOT_ALLOWLISTED" };
  }
  return {
    status: "Accepted",
    method: cmd.method ?? cmd.id,
    params: intent.params ?? {},
    topic: "v1/devices/me/rpc",
  };
}

export function tbTelemetryTopic() {
  return "v1/devices/me/telemetry";
}
