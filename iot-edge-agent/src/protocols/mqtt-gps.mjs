/** GPS / MQTT telemetry envelope helper for kit-cold-trk / cold-logistics. */

function formatCoord(n) {
  return typeof n === "number" && Number.isFinite(n) ? n.toFixed(2) : String(n);
}

export function gpsTelemetry({
  lat,
  lon,
  temperature,
  humidity,
  door = 0,
  shock_g,
  gateway_online,
  eventTime,
}) {
  const gps = `${formatCoord(lat)},${formatCoord(lon)}`;
  const record = {
    schemaVersion: "1",
    channelId: "gps",
    gps,
    lat,
    lon,
    temperature,
    door,
    eventTime: eventTime ?? new Date().toISOString(),
    value: { lat, lon },
  };
  if (humidity !== undefined) record.humidity = humidity;
  if (shock_g !== undefined) record.shock_g = shock_g;
  if (gateway_online !== undefined) record.gateway_online = gateway_online;
  return record;
}
