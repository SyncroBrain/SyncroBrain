/** Ring buffer with quality flags for offline backfill. */

export function createRingCache(limit = 1024) {
  const items = [];
  let lastOverflow = null;
  return {
    push(record) {
      if (items.length >= limit) {
        const dropped = items.shift();
        lastOverflow = { ...dropped, quality: "buffer_overflow" };
      }
      items.push(record);
    },
    drain() {
      const copy = [...items, lastOverflow].filter(Boolean);
      items.length = 0;
      lastOverflow = null;
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
