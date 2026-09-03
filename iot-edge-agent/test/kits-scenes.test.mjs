import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createAgent } from "../src/agent.mjs";
import { claimController, getKit, loadKits } from "../src/kits/catalog.mjs";
import { getPack } from "../src/packs/catalog.mjs";
import { evaluateScene } from "../src/scene/kernel.mjs";
import { mapEsp32Command, mapEsp32Telemetry, tbTelemetryTopic } from "../src/protocols/esp32-mqtt.mjs";
import { defineConnector } from "../src/sdk/connector.mjs";

describe("controller kits and scene kernel", () => {
  it("loads public kits and dual bind paths", () => {
    const slugs = loadKits().map((kit) => kit.slug).sort();
    assert.deepEqual(slugs, [
      "kit-cold-trk",
      "kit-env-node",
      "kit-fan-pwm",
      "kit-gw-esp",
      "kit-pond-ctrl",
      "kit-rly-4ch",
      "kit-valve-8z",
      "kit-win-act",
    ]);
    assert.equal(claimController({ kitSlug: "kit-win-act", bindPath: "official", serial: "SBK-WIN-1" }).status, "Accepted");
    assert.equal(claimController({ kitSlug: "kit-win-act", bindPath: "official", serial: "OEM-1" }).reason, "SERIAL");
    const proto = claimController({
      kitSlug: "kit-win-act",
      bindPath: "protocol",
      telemetryKeys: ["position_pct", "limit_open", "limit_close", "gateway_online"],
    });
    assert.equal(proto.status, "Accepted");
    assert.equal(
      claimController({ kitSlug: "kit-win-act", bindPath: "protocol", telemetryKeys: ["position_pct"] }).reason,
      "CHANNEL_GAP",
    );
  });

  it("maps ESP32 telemetry onto TB MQTT and rejects unknown RPC", () => {
    const kit = getKit("kit-win-act");
    const mapped = mapEsp32Telemetry({
      position_pct: 40,
      limit_open: 0,
      limit_close: 0,
      rain: 1,
      gateway_online: 1,
    }, kit);
    assert.equal(mapped.quality, "ok");
    assert.equal(mapped.value.rain, 1);
    assert.equal(tbTelemetryTopic(), "v1/devices/me/telemetry");
    assert.equal(mapEsp32Command({ commandId: "open" }, kit).status, "Accepted");
    assert.equal(mapEsp32Command({ commandId: "reboot" }, kit).reason, "NOT_ALLOWLISTED");
    const gap = mapEsp32Telemetry({ rain: 1 }, kit);
    assert.equal(gap.quality, "unmapped");
  });

  it("closes windows on rain, blocks open, and fail-closes AI without evidence", () => {
    const agent = createAgent();
    const close = agent.runPackScenes({
      packSlug: "smart-window",
      telemetry: { rain: 1, temperature: 22, limit_open: 0, limit_close: 0 },
    });
    assert.equal(close.decision, "dispatch");
    assert.equal(close.commandId, "close");

    const manualOpen = agent.runPackScenes({
      packSlug: "smart-window",
      telemetry: { rain: 1, limit_open: 0, limit_close: 0 },
      intent: { source: "user", commandId: "open" },
    });
    assert.equal(manualOpen.decision, "deny");
    assert.equal(manualOpen.reason, "INTERLOCK");

    const aiBlind = agent.runPackScenes({
      packSlug: "smart-window",
      telemetry: {},
      intent: { source: "ai", commandId: "setPosition", params: { pct: 40 } },
    });
    assert.equal(aiBlind.reason, "EVIDENCE");

    const aiOk = agent.runPackScenes({
      packSlug: "smart-window",
      telemetry: { temperature: 31, rain: 0, limit_open: 0, limit_close: 0 },
      intent: { source: "ai", commandId: "setPosition", params: { pct: 30 } },
    });
    assert.equal(aiOk.decision, "dispatch");
  });

  it("irrigates on dry soil, skips rain, and trips dry-run", () => {
    const agent = createAgent();
    const soil = agent.runPackScenes({
      packSlug: "agri-irrigation",
      telemetry: { soil_pct: 18, rain: 0 },
    });
    assert.equal(soil.commandId, "zoneOn");

    const wet = agent.runPackScenes({
      packSlug: "agri-irrigation",
      telemetry: { soil_pct: 18, rain: 1 },
      intent: { source: "user", commandId: "zoneOn", params: { zone: 1, durationSec: 600 } },
    });
    assert.equal(wet.reason, "INTERLOCK");

    const kit = getKit("kit-valve-8z");
    const dry = evaluateScene({
      scene: getPack("agri-irrigation").scenes.find((s) => s.id === "irr-soil-low"),
      kit,
      telemetry: { soil_pct: 10, rain: 0, flow_lpm: 0 },
      intent: { source: "policy", commandId: "zoneOn", params: { zone: 1 } },
      onDurationSec: 91,
    });
    assert.equal(dry.reason, "DRY_RUN");

    const timed = createAgent().runPackScenes({
      packSlug: "agri-irrigation",
      telemetry: { soil_pct: 40, rain: 0, in_window: 1 },
    });
    assert.equal(timed.commandId, "zoneOn");
  });

  it("aerates on low DO and refuses spray when the pond is dry", () => {
    const agent = createAgent();
    const air = agent.runPackScenes({
      packSlug: "agri-pond",
      telemetry: { do_mgl: 2.1, water_temp_c: 24, water_level_m: 1.2 },
    });
    assert.equal(air.commandId, "aeratorOn");

    const spray = agent.runPackScenes({
      packSlug: "agri-pond",
      telemetry: { do_mgl: 6, water_temp_c: 24, water_level_m: 0.1 },
      intent: { source: "user", commandId: "sprayOn" },
    });
    assert.equal(spray.reason, "INTERLOCK");
  });

  it("still closes on rain when heat-vent would interlock open", () => {
    const mixed = createAgent().runPackScenes({
      packSlug: "smart-window",
      telemetry: { rain: 1, temperature: 32, limit_open: 0, limit_close: 0 },
    });
    assert.equal(mixed.decision, "dispatch");
    assert.equal(mixed.commandId, "close");
  });

  it("fail-closes kit commands under kill switch and out-of-range setpoints", () => {
    const killed = createAgent({ killSwitch: true });
    assert.equal(
      killed.evaluateScene({
        scene: getPack("smart-window").scenes[0],
        kitSlug: "kit-win-act",
        intent: { source: "user", commandId: "close" },
      }).reason,
      "KILL_SWITCH",
    );
    const over = evaluateScene({
      scene: getPack("smart-window").scenes.find((s) => s.id === "win-manual"),
      kit: getKit("kit-win-act"),
      telemetry: { rain: 0, limit_open: 0, limit_close: 0 },
      intent: { source: "user", commandId: "setPosition", params: { pct: 140 } },
    });
    assert.equal(over.reason, "OUT_OF_RANGE");
  });

  it("exposes an ESP32 window connector without domain leaks", () => {
    const kit = getKit("kit-win-act");
    const connector = defineConnector({
      protocol: "esp32-mqtt",
      mapTelemetry: (raw) => mapEsp32Telemetry(raw, kit).value,
      mapCommand: (intent) => mapEsp32Command(intent, kit),
    });
    assert.equal(connector.ingest({ position_pct: 10 }).position_pct, 10);
    assert.equal(connector.command({ commandId: "stop" }).status, "Accepted");
  });
});
