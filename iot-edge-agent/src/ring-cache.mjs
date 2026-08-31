/** Ring buffer with quality flags for offline backfill. */

export function createRingCache(limit = 1024) {
  const items = [];
  return {
    push(record) {
      items.push(record);
      if (items.length > limit) items.shift();
    },
    drain() {
      const copy = items.slice();
      items.length = 0;
      return copy;
    },
    size() {
      return items.length;
    },
  };
}

export function stampQuality(record, { now = Date.now(), maxSkewMs = 60_000 } = {}) {
  const eventTime = Date.parse(record.eventTime ?? "") || now;
  let quality = record.quality ?? "ok";
  if (eventTime > now + maxSkewMs) quality = "clock_skew";
  else if (eventTime < now - 5 * 60_000) quality = "late";
  return { ...record, quality, ingestedAt: new Date(now).toISOString() };
}
