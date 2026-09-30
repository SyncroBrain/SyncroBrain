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

运营话术：可演示标准协议闭环；具体桩/PCS/探头需客户提供型号后进入 `hardware-verified` 队列。芯片与 PCB 模板（含非乐鑫方案）见 [hardware-templates.md](./hardware-templates.md)，**模板 ≠ 已认证硬件**。

## 待实机队列

下列型号已进入实机实验室排队（软件前置与参考固件就绪），**状态仍为 `protocol-verified`**，品牌列 **未** 标 `hardware-verified`。勾选清单见 [hardware-lab-checklist.md](../plan/validation/hardware-lab-checklist.md)；验收条款见 [iot-lab-acceptance.md](./iot-lab-acceptance.md) §7。

| 型号 | 队列状态 | 矩阵状态列 | 品牌列 |
|------|----------|------------|--------|
| ESP32-C3 DevKit | 待实机（queued for hardware-verified） | protocol-verified | 未实机，不得标 hardware-verified |
| ESP32-S3 DevKitC-1 | 待实机（queued for hardware-verified） | protocol-verified | 未实机，不得标 hardware-verified |

全部清单行勾选并填写日期/执行人之前，禁止把上表升级为 `hardware-verified`。
