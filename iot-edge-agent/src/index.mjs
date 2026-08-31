import { createAgent } from "./agent.mjs";

const agent = createAgent({
  protocols: process.env.EDGE_PROTOCOLS,
  killSwitch: process.env.EDGE_KILL_SWITCH === "true",
});

console.log(
  JSON.stringify({
    service: "iot-edge-agent",
    protocols: [...agent.protocols],
    status: "ok",
  }),
);

if (process.env.EDGE_STAY === "true") {
  setInterval(() => {}, 1 << 30);
}
