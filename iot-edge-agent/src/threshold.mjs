/** Deterministic local thresholds. Edge keeps running when the cloud/AI is down. */

export function evaluateLocalThreshold(sample, rules = []) {
  for (const rule of rules) {
    const value = sample?.[rule.key];
    if (typeof value !== "number" || !Number.isFinite(value)) continue;
    if (rule.max != null && value > rule.max) {
      return { alarm: true, key: rule.key, value, rule };
    }
    if (rule.min != null && value < rule.min) {
      return { alarm: true, key: rule.key, value, rule };
    }
  }
  return { alarm: false };
}
