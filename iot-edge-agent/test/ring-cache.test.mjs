import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createAgent } from "../src/agent.mjs";
import { createRingCache, stampQuality } from "../src/ring-cache.mjs";

describe("edge agent ring cache", () => {
  it("drops the oldest record and reports buffer_overflow on drain", () => {
    const cache = createRingCache(2);
    cache.push({ id: "a", quality: "ok" });
    cache.push({ id: "b", quality: "ok" });
    cache.push({ id: "c", quality: "ok" });
    assert.equal(cache.size(), 2);
    const drained = cache.drain();
    assert.equal(drained.length, 3);
    const overflow = drained.find((row) => row.quality === "buffer_overflow");
    assert.ok(overflow);
    assert.equal(overflow.id, "a");
    assert.deepEqual(
      drained.filter((row) => row.quality !== "buffer_overflow").map((row) => row.id),
      ["b", "c"],
    );
    assert.equal(cache.size(), 0);
    assert.equal(cache.drain().length, 0);
  });

  it("keeps clock_skew and late stamps", () => {
    const now = Date.parse("2026-09-09T12:00:00.000Z");
    const skew = stampQuality({ eventTime: "2026-09-09T12:05:00.000Z" }, { now, maxSkewMs: 60_000 });
    assert.equal(skew.quality, "clock_skew");
    const late = stampQuality({ eventTime: "2026-09-09T11:50:00.000Z" }, { now });
    assert.equal(late.quality, "late");
    const ok = stampQuality({ eventTime: "2026-09-09T12:00:01.000Z", quality: "ok" }, { now });
    assert.equal(ok.quality, "ok");
  });

  it("preserves buffer_overflow when the agent flushes after overflow", () => {
    const agent = createAgent({ cacheLimit: 2 });
    agent.ingest({ channelId: "t", value: 1, eventTime: new Date().toISOString() });
    agent.ingest({ channelId: "t", value: 2, eventTime: new Date().toISOString() });
    agent.ingest({ channelId: "t", value: 3, eventTime: new Date().toISOString() });
    const flushed = agent.flush();
    assert.ok(flushed.some((row) => row.quality === "buffer_overflow"));
    assert.ok(flushed.some((row) => row.quality === "backfill"));
  });
});
