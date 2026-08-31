import { createRingCache, stampQuality } from "./ring-cache.mjs";
import { authorizeRemoteStop, handleCall, ocppCall, parseOcpp } from "./protocols/ocpp.mjs";
import { applyMap } from "./protocols/modbus.mjs";
import { applySubscriptions, encodeDataValue } from "./protocols/opcua.mjs";
import { gpsTelemetry } from "./protocols/mqtt-gps.mjs";
import { evaluateLocalThreshold } from "./threshold.mjs";
import { rotateCert, siteCredentialEnvelope } from "./identity.mjs";
import { recordFrame, replay } from "./replay.mjs";

export function createAgent(opts = {}) {
  const cache = createRingCache(opts.cacheLimit ?? 256);
  const protocols = new Set((opts.protocols ?? "ocpp16,modbus-tcp,opcua,gps").split(","));
  const killSwitch = Boolean(opts.killSwitch);
  const tape = [];
  const identity = siteCredentialEnvelope({
    siteId: opts.siteId ?? "site-demo",
    nodeId: opts.nodeId ?? "edge-1",
  });

  return {
    protocols,
    identity,
    ingest(record) {
      const stamped = stampQuality(record);
      cache.push(stamped);
      return stamped;
    },
    flush() {
      return cache.drain().map((r) => ({ ...r, quality: "backfill" }));
    },
    handleOcpp(raw) {
      const frame = parseOcpp(raw);
      if (frame.messageType !== 2) return null;
      if (killSwitch && !["BootNotification", "Heartbeat", "StatusNotification", "StartTransaction", "StopTransaction", "MeterValues"].includes(String(frame.action))) {
        return { status: "Rejected", reason: "KILL_SWITCH" };
      }
      return handleCall(frame.action, frame.payload, opts.ctx ?? {});
    },
    remoteStop() {
      return authorizeRemoteStop({}, { allowlist: killSwitch ? [] : ["remoteStop"] });
    },
    pollModbus(registers, map) {
      return applyMap(registers, map);
    },
    opcuaNotify(nodes, values) {
      const notifications = values.map((v) => encodeDataValue(v.nodeId, v.value));
      return applySubscriptions(nodes, notifications);
    },
    gps(sample) {
      return this.ingest(gpsTelemetry(sample));
    },
    localAlarm(sample, rules) {
      return evaluateLocalThreshold(sample, rules);
    },
    rotateCert() {
      return rotateCert(identity);
    },
    record(frame) {
      return recordFrame(tape, frame);
    },
    replay(handler) {
      return replay(tape, handler);
    },
    consumeOutbox(commands, execute) {
      return commands.map((cmd) => {
        if (killSwitch) {
          return { outboxId: cmd.outboxId, status: "Rejected", reason: "KILL_SWITCH" };
        }
        const result = execute ? execute(cmd) : { status: "Accepted" };
        return { outboxId: cmd.outboxId, commandRowId: cmd.commandRowId, ...result };
      });
    },
    ocppCall,
  };
}
