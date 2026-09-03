import { defineConnector } from "../src/sdk/connector.mjs";
import { getKit } from "../src/kits/catalog.mjs";
import { mapEsp32Command, mapEsp32Telemetry } from "../src/protocols/esp32-mqtt.mjs";

const kit = getKit("kit-win-act");

/** Official ESP32 window kit → TB MQTT channel keys. */
export const esp32WindowConnector = defineConnector({
  protocol: "esp32-mqtt",
  version: "1",
  mapTelemetry(raw) {
    return mapEsp32Telemetry(raw, kit).value;
  },
  mapCommand(intent) {
    return mapEsp32Command(intent, kit);
  },
});
