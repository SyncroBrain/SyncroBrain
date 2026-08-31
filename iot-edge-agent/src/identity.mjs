/**
 * Site-scoped identity. Edge never stores LLM-facing device TLS private keys
 * in command payloads. Rotation is serial-only in L1 (no live CA).
 */

export function siteCredentialEnvelope({ siteId, nodeId }) {
  return {
    kind: "site",
    siteId,
    nodeId,
    neverDeviceTlsPrivateKey: true,
    mtls: process.env.EDGE_MTLS === "true",
  };
}

export function rotateCert(current = {}) {
  const serial = Number(current.serial ?? 0) + 1;
  return {
    serial,
    rotatedAt: new Date().toISOString(),
    previousSerial: current.serial ?? 0,
  };
}
