/** GPS / MQTT telemetry envelope helper. */

export function gpsTelemetry({ lat, lon, temperature, door = 0, eventTime }) {
  return {
    schemaVersion: "1",
    channelId: "gps",
    lat,
    lon,
    temperature,
    door,
    eventTime: eventTime ?? new Date().toISOString(),
    value: { lat, lon },
  };
}
