import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { evaluateLocalThreshold } from "../src/threshold.mjs";

describe("edge local thresholds", () => {
  it("alarms when value is above max", () => {
    const hit = evaluateLocalThreshold({ soc_pct: 95 }, [{ key: "soc_pct", max: 90 }]);
    assert.equal(hit.alarm, true);
    assert.equal(hit.key, "soc_pct");
    assert.equal(hit.value, 95);
    assert.equal(hit.rule.max, 90);
  });

  it("alarms when value is below min", () => {
    const hit = evaluateLocalThreshold({ temperature: 1 }, [{ key: "temperature", min: 2 }]);
    assert.equal(hit.alarm, true);
    assert.equal(hit.key, "temperature");
    assert.equal(hit.value, 1);
    assert.equal(hit.rule.min, 2);
  });

  it("does not alarm when value is in range", () => {
    const hit = evaluateLocalThreshold({ temperature: 4 }, [
      { key: "temperature", min: 2, max: 8 },
    ]);
    assert.equal(hit.alarm, false);
    assert.equal(hit.key, undefined);
  });

  it("skips non-numeric and missing keys without throwing", () => {
    const rules = [
      { key: "missing", max: 1 },
      { key: "nan", max: 1 },
      { key: "inf", max: 1 },
      { key: "text", max: 1 },
      { key: "ok", max: 10 },
    ];
    const sample = { nan: Number.NaN, inf: Number.POSITIVE_INFINITY, text: "12", ok: 3 };
    assert.doesNotThrow(() => evaluateLocalThreshold(sample, rules));
    assert.doesNotThrow(() => evaluateLocalThreshold(undefined, rules));
    assert.doesNotThrow(() => evaluateLocalThreshold(null, rules));
    assert.equal(evaluateLocalThreshold(sample, rules).alarm, false);
    assert.equal(evaluateLocalThreshold(undefined, rules).alarm, false);
    assert.equal(evaluateLocalThreshold(null, rules).alarm, false);
  });

  it("returns the first matching rule (iteration order; max before min on the same rule)", () => {
    const first = { key: "temperature", max: 8 };
    const second = { key: "humidity", max: 70 };
    const hit = evaluateLocalThreshold({ temperature: 12, humidity: 90 }, [first, second]);
    assert.equal(hit.alarm, true);
    assert.equal(hit.key, "temperature");
    assert.equal(hit.rule, first);

    const skippedThenHit = evaluateLocalThreshold({ humidity: 90 }, [first, second]);
    assert.equal(skippedThenHit.key, "humidity");

    const bothBounds = evaluateLocalThreshold({ temperature: 12 }, [
      { key: "temperature", min: 20, max: 8 },
    ]);
    assert.equal(bothBounds.alarm, true);
    assert.equal(bothBounds.rule.max, 8);
  });
});
