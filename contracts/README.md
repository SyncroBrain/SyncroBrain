# Contracts

| 文件 | 状态 | 用途 |
|------|------|------|
| [gateway.v1.yaml](./gateway.v1.yaml) | **Cloud Lite** | health / packs / demos / alarms / projects / incidents / commands / AI / edge / license；端口 **13200** |
| [entitlement.v1.yaml](./entitlement.v1.yaml) | **离线 SKU** | 可配置许可，非在线扣费 |
| [device.v1.yaml](./device.v1.yaml) | **遗留 Device CRUD** | 禁止静默破坏；**不是** Pack/告警合同 |
| [schemas/pack-manifest.schema.json](./schemas/pack-manifest.schema.json) | **Pack Factory** | Industry Pack manifest |
| [schemas/telemetry-envelope.schema.json](./schemas/telemetry-envelope.schema.json) | Pack 内部信封 | 设备生产 MQTT 仍用 TB topic |
| [schemas/command.schema.json](./schemas/command.schema.json) | 命令 | 幂等投递与回执 |
| [schemas/incident.schema.json](./schemas/incident.schema.json) | Incident 内核 | 与 TB Alarm 映射 |
| [schemas/edge-registration.schema.json](./schemas/edge-registration.schema.json) | EdgeAgent | 节点注册 |
| [schemas/action-policy.schema.json](./schemas/action-policy.schema.json) | AI 自治包络 | Safety Kernel |
| [drafts/telemetry-envelope.md](./drafts/telemetry-envelope.md) | 叙事草案 | 与 JSON Schema 对齐 |

契约烟测（无活栈）：`pnpm test:contract`。
