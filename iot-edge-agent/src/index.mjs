import { pathToFileURL } from "node:url";
import { createAgent } from "./agent.mjs";
import { startOutboxFromEnv } from "./outbox-client.mjs";

export function main(env = process.env, hooks = {}) {
  const nodeId = env.EDGE_NODE_ID?.trim();
  const agent = createAgent({
    protocols: env.EDGE_PROTOCOLS,
    killSwitch: env.EDGE_KILL_SWITCH === "true",
    ...(nodeId ? { nodeId } : {}),
  });
  const outbox = startOutboxFromEnv(agent, env, hooks);
  const status = {
    service: "iot-edge-agent",
    protocols: [...agent.protocols],
    status: "ok",
  };
  if (outbox.mode === "live") {
    status.nodeId = agent.identity.nodeId;
    status.outbox = "polling";
  }
  return { agent, outbox, status };
}

const entry = process.argv[1];
if (entry && import.meta.url === pathToFileURL(entry).href) {
  const { status, outbox } = main();
  console.log(JSON.stringify(status));
  if (outbox.mode === "sim" && process.env.EDGE_STAY === "true") {
    setInterval(() => {}, 1 << 30);
  }
}
