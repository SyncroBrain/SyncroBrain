import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createAgent } from "../src/agent.mjs";
import { ocppCall } from "../src/protocols/ocpp.mjs";
import { buildReadHoldingRegisters } from "../src/protocols/modbus.mjs";

describe("edge agent protocols", () => {
  it("accepts OCPP BootNotification and Heartbeat", () => {
    const agent = createAgent();
    const boot = agent.handleOcpp(ocppCall("1", "BootNotification", { chargePointVendor: "sim" }));
    assert.equal(boot.status, "Accepted");
    const hb = agent.handleOcpp(ocppCall("2", "Heartbeat", {}));
    assert.ok(hb.currentTime);
  });

  it("fail-closes remote stop when kill switch is on", () => {
    const agent = createAgent({ killSwitch: true });
    assert.equal(agent.remoteStop().status, "Rejected");
  });

  it("maps Modbus holding registers", () => {
    const agent = createAgent();
    const values = agent.pollModbus({ 0: 550, 1: 280 }, {
      soc_pct: { offset: 0, type: "u16", scale: 0.1 },
      cell_temp_c: { offset: 1, type: "u16", scale: 0.1 },
    });
    assert.equal(values.soc_pct, 55);
    assert.equal(values.cell_temp_c, 28);
    const adu = buildReadHoldingRegisters(1, 0, 2);
    assert.equal(adu[7], 0x03);
  });

  it("filters OPC UA subscriptions and GPS backfill quality", () => {
    const agent = createAgent();
    const notes = agent.opcuaNotify(["ns=2;s=Temp"], [
      { nodeId: "ns=2;s=Temp", value: 4.2 },
      { nodeId: "ns=2;s=Other", value: 1 },
    ]);
    assert.equal(notes.length, 1);
    agent.gps({ lat: 31.2, lon: 121.4, temperature: 4, eventTime: new Date(Date.now() - 10 * 60_000).toISOString() });
    const flushed = agent.flush();
    assert.equal(flushed[0].quality, "backfill");
  });

  it("accepts OCPP 2.0.1 RequestStopTransaction unless kill switch", () => {
    const agent = createAgent();
    const stop = agent.handleOcpp(ocppCall("3", "RequestStopTransaction", { transactionId: 1 }));
    assert.equal(stop.status, "Accepted");
    const killed = createAgent({ killSwitch: true });
    const denied = killed.handleOcpp(ocppCall("4", "RequestStopTransaction", { transactionId: 1 }));
    assert.equal(denied.status, "Rejected");
  });

  it("builds Modbus RTU frames and fires local thresholds", async () => {
    const { buildReadHoldingRegistersRtu, crc16 } = await import("../src/protocols/modbus.mjs");
    const rtu = buildReadHoldingRegistersRtu(1, 0, 2);
    assert.equal(rtu[1], 0x03);
    assert.equal(crc16(rtu.subarray(0, 6)), rtu.readUInt16LE(6));
    const agent = createAgent();
    const hit = agent.localAlarm({ soc_pct: 95 }, [{ key: "soc_pct", max: 90 }]);
    assert.equal(hit.alarm, true);
  });

  it("replays recorded frames and keeps identity site-scoped", async () => {
    const { defineConnector } = await import("../src/sdk/connector.mjs");
    const agent = createAgent({ nodeId: "edge-lab" });
    agent.record(ocppCall("9", "Heartbeat", {}));
    const results = agent.replay((raw) => agent.handleOcpp(raw));
    assert.ok(results[0].currentTime);
    assert.equal(agent.identity.kind, "site");
    assert.equal(agent.identity.neverDeviceTlsPrivateKey, true);
    const connector = defineConnector({
      protocol: "modbus-tcp",
      mapTelemetry: (raw) => ({ temperature: raw.t }),
      mapCommand: (intent) => ({ status: intent.commandId === "ping" ? "Accepted" : "Rejected" }),
    });
    assert.equal(connector.ingest({ t: 4.1 }).temperature, 4.1);
    assert.equal(connector.command({ commandId: "ping" }).status, "Accepted");
    const receipts = agent.consumeOutbox(
      [{ outboxId: "ob-1", commandRowId: "c1", commandId: "ping" }],
      (cmd) => connector.command(cmd),
    );
    assert.equal(receipts[0].status, "Accepted");
    const killed = createAgent({ killSwitch: true });
    assert.equal(
      killed.consumeOutbox([{ outboxId: "ob-2", commandId: "remoteStop" }])[0].status,
      "Rejected",
    );
  });
});
