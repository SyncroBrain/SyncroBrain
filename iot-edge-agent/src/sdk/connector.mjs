/**
 * Connector SDK: vendor dialects stay in Pack adapters, not domain objects.
 * Protocol-verified connectors implement ingest + command only.
 */

export function defineConnector({ protocol, version, mapTelemetry, mapCommand }) {
  if (!protocol) throw new Error("connector protocol required");
  return {
    protocol,
    version: version ?? "1",
    ingest(raw, ctx = {}) {
      const sample = mapTelemetry(raw, ctx);
      if (!sample || typeof sample !== "object") {
        throw new Error(`${protocol}: mapTelemetry must return an object`);
      }
      return { protocol, ...sample };
    },
    command(intent, ctx = {}) {
      if (!intent?.commandId) return { status: "Rejected", reason: "MISSING_COMMAND" };
      return mapCommand(intent, ctx);
    },
  };
}

export function assertNoDomainLeak(sample) {
  const banned = ["tbTenantId", "licenseKey", "devicePrivateKey"];
  for (const key of banned) {
    if (key in (sample ?? {})) throw new Error(`domain leak: ${key}`);
  }
}
