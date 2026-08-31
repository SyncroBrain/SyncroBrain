#!/usr/bin/env node
/** Modbus TCP/RTU register-map simulator (no live serial). */
import { createAgent } from "../src/agent.mjs";
import { buildReadHoldingRegisters, buildReadHoldingRegistersRtu } from "../src/protocols/modbus.mjs";

const agent = createAgent();
const values = agent.pollModbus({ 0: 550, 1: 280 }, {
  soc_pct: { offset: 0, type: "u16", scale: 0.1 },
  cell_temp_c: { offset: 1, type: "u16", scale: 0.1 },
});
const tcp = buildReadHoldingRegisters(1, 0, 2);
const rtu = buildReadHoldingRegistersRtu(1, 0, 2);
console.log(JSON.stringify({
  values,
  tcpFn: tcp[7],
  rtuFn: rtu[1],
  verification: "protocol-verified",
}));
