import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { gpsTelemetry } from "../src/protocols/mqtt-gps.mjs";
import { createAgent } from "../src/agent.mjs";

describe("mqtt-gps cold-logistics telemetry", () => {
  it("emits gps geo string plus numeric lat/lon for TB MQTT", () => {
    const eventTime = "2026-09-09T12:00:00.000Z";
    const record = gpsTelemetry({
      lat: 35.1,
      lon: 120.2,
      temperature: 4.5,
      door: 0,
      shock_g: 0.1,
      gateway_online: 1,
      eventTime,
    });
    assert.equal(record.schemaVersion, "1");
    assert.equal(record.channelId, "gps");
    assert.equal(record.eventTime, eventTime);
    assert.equal(record.gps, "35.10,120.20");
    assert.equal(record.lat, 35.1);
    assert.equal(record.lon, 120.2);
    assert.equal(record.temperature, 4.5);
    assert.equal(record.door, 0);
    assert.equal(record.shock_g, 0.1);
    assert.equal(record.gateway_online, 1);
    assert.equal(record.humidity, undefined);
    assert.deepEqual(record.value, { lat: 35.1, lon: 120.2 });
  });

  it("passes optional humidity and defaults door without dropping value lat/lon", () => {
    const record = gpsTelemetry({
      lat: 0,
      lon: 0,
      temperature: 4,
      humidity: 62.5,
    });
    assert.equal(record.gps, "0.00,0.00");
    assert.equal(record.lat, 0);
    assert.equal(record.lon, 0);
    assert.equal(record.humidity, 62.5);
    assert.equal(record.door, 0);
    assert.equal("shock_g" in record, false);
    assert.equal("gateway_online" in record, false);
    assert.equal(record.value.lat, 0);
    assert.equal(record.value.lon, 0);
  });

  it("keeps agent gps flush backfill and buffer_overflow flags", () => {
    const late = createAgent();
    const stamped = late.gps({
      lat: 31.2,
      lon: 121.4,
      temperature: 4,
      eventTime: new Date(Date.now() - 10 * 60_000).toISOString(),
    });
    assert.equal(stamped.gps, "31.20,121.40");
    assert.equal(stamped.lat, 31.2);
    assert.equal(stamped.lon, 121.4);
    const flushed = late.flush();
    assert.equal(flushed[0].quality, "backfill");
    assert.equal(flushed[0].gps, "31.20,121.40");

    const overflow = createAgent({ cacheLimit: 2 });
    overflow.gps({ lat: 1, lon: 2, temperature: 4, eventTime: new Date().toISOString() });
    overflow.gps({ lat: 3, lon: 4, temperature: 4, eventTime: new Date().toISOString() });
    overflow.gps({ lat: 5, lon: 6, temperature: 4, eventTime: new Date().toISOString() });
    const drained = overflow.flush();
    assert.ok(drained.some((row) => row.quality === "buffer_overflow"));
    assert.ok(drained.some((row) => row.quality === "backfill"));
  });
});
