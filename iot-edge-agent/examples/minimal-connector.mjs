import { defineConnector } from "../src/sdk/connector.mjs";

export const exampleModbusConnector = defineConnector({
  protocol: "modbus-tcp",
  version: "1",
  mapTelemetry(registers) {
    return { temperature: Number(registers[0]) * 0.1 };
  },
  mapCommand(intent) {
    if (intent.commandId === "ping") return { status: "Accepted" };
    return { status: "Rejected", reason: "NOT_ALLOWLISTED" };
  },
});
