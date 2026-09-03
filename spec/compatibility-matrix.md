# 兼容矩阵 (v0.1)

> 只有通过对应门禁的条目才能标为已验证。空的品牌列表示 **尚未实机认证**，不是「不支持该协议」。

| 协议 | 版本 | 仿真器 | 状态 | 实机品牌/型号 |
|------|------|--------|------|----------------|
| MQTT (TB) | v1/v2 topic | mqtt-sim / Fake TB | protocol-verified | — |
| ESP32 Kit MQTT | 公版通道 + RPC | `esp32-kit-sim` | protocol-verified | — |
| ESP32-C3 DevKit | Arduino 参考固件 `firmware/esp32-kit` | kit-sim + Fake TB | protocol-verified | 未实机，不得标 hardware-verified |
| ESP32-S3 DevKitC-1 | Arduino 参考固件 `firmware/esp32-kit` | kit-sim + Fake TB | protocol-verified | 未实机，不得标 hardware-verified |
| OCPP | 1.6J / 2.0.1 | `iot-edge-agent` ocpp-sim | protocol-verified | — |
| Modbus | RTU / TCP | `iot-edge-agent` modbus-sim | protocol-verified | — |
| OPC UA | 1.04 subscribe | `iot-edge-agent` opcua-sim | protocol-verified | — |
| MQTT/HTTP GPS | 遥测信封 | gps-sim | protocol-verified | — |

运营话术：可演示标准协议闭环；具体桩/PCS/探头需客户提供型号后进入 `hardware-verified` 队列。
