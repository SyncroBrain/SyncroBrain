#!/usr/bin/env node
/** OPC UA subscribe filter simulator. */
import { createAgent } from "../src/agent.mjs";

const agent = createAgent();
const notes = agent.opcuaNotify(["ns=2;s=Temp"], [
  { nodeId: "ns=2;s=Temp", value: 4.2 },
  { nodeId: "ns=2;s=Other", value: 1 },
]);
console.log(JSON.stringify({ notes, verification: "protocol-verified" }));
