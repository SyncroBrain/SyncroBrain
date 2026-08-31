/**
 * Minimal OCPP 1.6J / 2.0.1 call/result framing (JSON).
 * Not a full CSMS; enough to protocol-verify BootNotification / Heartbeat / RemoteStop.
 */

export function ocppCall(uniqueId, action, payload) {
  return JSON.stringify([2, uniqueId, action, payload ?? {}]);
}

export function ocppResult(uniqueId, payload) {
  return JSON.stringify([3, uniqueId, payload ?? {}]);
}

export function parseOcpp(raw) {
  const msg = JSON.parse(raw);
  if (!Array.isArray(msg) || (msg[0] !== 2 && msg[0] !== 3 && msg[0] !== 4)) {
    throw new Error("not an OCPP frame");
  }
  return { messageType: msg[0], uniqueId: msg[1], action: msg[2], payload: msg[3] ?? msg[2] };
}

export function handleCall(action, payload, ctx = {}) {
  switch (action) {
    case "BootNotification":
      return { status: "Accepted", currentTime: new Date().toISOString(), interval: 300 };
    case "Heartbeat":
      return { currentTime: new Date().toISOString() };
    case "StatusNotification":
      ctx.lastStatus = payload?.status ?? payload?.connectorStatus;
      return {};
    case "StartTransaction":
      ctx.transactionId = (ctx.transactionId ?? 1000) + 1;
      return { transactionId: ctx.transactionId, idTagInfo: { status: "Accepted" } };
    case "StopTransaction":
      return { idTagInfo: { status: "Accepted" } };
    case "MeterValues":
      return {};
    case "RemoteStopTransaction":
    case "RequestStopTransaction":
      return { status: "Accepted" };
    case "SetChargingProfile":
      return { status: "Accepted" };
    default:
      return { status: "Rejected" };
  }
}

export function authorizeRemoteStop(envelope, { allowlist = ["remoteStop"] } = {}) {
  if (!allowlist.includes("remoteStop")) return { status: "Rejected", reason: "NOT_ALLOWLISTED" };
  return { status: "Accepted" };
}
