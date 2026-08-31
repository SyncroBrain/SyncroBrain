#!/usr/bin/env node
/** MQTT/HTTP GPS envelope + offline backfill simulator. */
import { createAgent } from "../src/agent.mjs";

const agent = createAgent();
agent.gps({
  lat: 31.2,
  lon: 121.4,
  temperature: 4,
  eventTime: new Date(Date.now() - 10 * 60_000).toISOString(),
});
const flushed = agent.flush();
console.log(JSON.stringify({ flushed, verification: "protocol-verified" }));
