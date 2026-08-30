# Contracts

| 文件 | 状态 | 用途 |
|------|------|------|
| [gateway.v1.yaml](./gateway.v1.yaml) | **Cloud Lite** | health / packs / demos / alarms / license；端口 **13200** |
| [entitlement.v1.yaml](./entitlement.v1.yaml) | **离线 SKU** | 可配置许可，非在线扣费 |
| [device.v1.yaml](./device.v1.yaml) | **遗留 Device CRUD** | 禁止静默破坏；**不是** Pack/告警合同 |
| [drafts/telemetry-envelope.md](./drafts/telemetry-envelope.md) | 草案 | Pack 内部规范化；**设备生产 MQTT 用 TB topic** |

契约烟测（无活栈）：`pnpm test:contract`。

领域 HTTP（projects / sites / assets / incidents）在评审通过前**不**以 OpenAPI 对外。草案路径见 [spec/device-domain.md](../spec/device-domain.md) §6.2。
