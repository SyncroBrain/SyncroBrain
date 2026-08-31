#!/usr/bin/env node
/** OCPP 1.6J / 2.0.1 JSON frame simulator (no live WebSocket). */
import { createAgent } from "../src/agent.mjs";
import { ocppCall } from "../src/protocols/ocpp.mjs";

const agent = createAgent({ killSwitch: process.env.EDGE_KILL_SWITCH === "true" });
const boot = agent.handleOcpp(ocppCall("1", "BootNotification", { chargePointVendor: "sim" }));
const stop = agent.handleOcpp(ocppCall("2", "RequestStopTransaction", { transactionId: 1 }));
console.log(JSON.stringify({ boot, stop, verification: "protocol-verified" }));
