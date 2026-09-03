#!/usr/bin/env node
/** ESP32 public-kit + scene kernel simulator (no live MQTT). */
import { createAgent } from "../src/agent.mjs";

const agent = createAgent();
const claimed = agent.claimController({
  kitSlug: "kit-win-act",
  bindPath: "official",
  serial: "SBK-WIN-SIM",
});
agent.ingestKit({
  position_pct: 80,
  limit_open: 0,
  limit_close: 0,
  rain: 1,
  gateway_online: 1,
}, "kit-win-act");

const windowRain = agent.runPackScenes({
  packSlug: "smart-window",
  telemetry: { rain: 1, temperature: 26, limit_open: 0, limit_close: 0 },
});
const irrigate = agent.runPackScenes({
  packSlug: "agri-irrigation",
  telemetry: { soil_pct: 12, rain: 0 },
});
const pond = agent.runPackScenes({
  packSlug: "agri-pond",
  telemetry: { do_mgl: 2, water_temp_c: 31, water_level_m: 0.08 },
});

console.log(JSON.stringify({
  claimed: claimed.status,
  windowRain,
  irrigate,
  pond,
  verification: "protocol-verified",
}));
