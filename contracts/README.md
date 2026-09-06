# Contracts

| 文件 | 状态 | 用途 |
|------|------|------|
| [gateway.v1.yaml](./gateway.v1.yaml) | **Cloud Lite** | health / packs / demos / alarms / projects / incidents / commands / AI / edge / license / education-labs / 可选 integrations；端口 **13200** |
| [doerflow.v1.yaml](./doerflow.v1.yaml) | **可选、默认关** | DoerFlow HMAC invoke / callback / connections；不进默认 Build |
| [entitlement.v1.yaml](./entitlement.v1.yaml) | **离线 SKU** | 可配置许可，非在线扣费 |
| [device.v1.yaml](./device.v1.yaml) | **遗留 Device CRUD** | 禁止静默破坏；**不是** Pack/告警合同 |
| [schemas/pack-manifest.schema.json](./schemas/pack-manifest.schema.json) | **Pack Factory** | Industry Pack manifest |
| [schemas/telemetry-envelope.schema.json](./schemas/telemetry-envelope.schema.json) | Pack 内部信封 | 设备生产 MQTT 仍用 TB topic |
| [schemas/command.schema.json](./schemas/command.schema.json) | 命令 | 幂等投递与回执 |
| [schemas/incident.schema.json](./schemas/incident.schema.json) | Incident 内核 | 与 TB Alarm 映射 |
| [schemas/edge-registration.schema.json](./schemas/edge-registration.schema.json) | EdgeAgent | 节点注册 |
| [schemas/action-policy.schema.json](./schemas/action-policy.schema.json) | AI 自治包络 | Safety Kernel |
| [schemas/controller-kit.schema.json](./schemas/controller-kit.schema.json) | 公版控制器 | ESP32 Kit 通道/命令/包络 |
| [schemas/scene.schema.json](./schemas/scene.schema.json) | 场景中台 | 手动 / 策略 / AI / `external_event` |
| [schemas/external-event-profile.schema.json](./schemas/external-event-profile.schema.json) | VistaCast 联动 Profile | 仓储 / 楼宇 / 看护 |
| [schemas/alert.v1.schema.json](./schemas/alert.v1.schema.json) | 跨产品告警 | 从 VistaCast vendored；禁止 TB 遥测 topic |
| [schemas/doerflow-provider-registration.schema.json](./schemas/doerflow-provider-registration.schema.json) | DoerFlow 卖方注册 | productCode=syncrobrain + 固定 offeringCode |
| [schemas/doerflow-invoke.schema.json](./schemas/doerflow-invoke.schema.json) | Invoke CloudEvent | `com.doerflow.trading.job.invoke` |
| [schemas/doerflow-event.schema.json](./schemas/doerflow-event.schema.json) | 出站 CloudEvent | incident / work-order → `/integrations/events` |
| [schemas/doerflow-callback.schema.json](./schemas/doerflow-callback.schema.json) | 生命周期 callback | HMAC；禁止设备命令 |
| [schemas/telemetry-digest.v1.schema.json](./schemas/telemetry-digest.v1.schema.json) | 时间窗 digest | 聚合 + hash；非逐点、非 TelemetryEnvelope |
| [schemas/incident-report.v1.schema.json](./schemas/incident-report.v1.schema.json) | 批次 incident report | hash/引用；无凭据 |
| [examples/](./examples/) | 合同样例 | provider / invoke / event / digest / report |
| [drafts/telemetry-envelope.md](./drafts/telemetry-envelope.md) | 叙事草案 | 与 JSON Schema 对齐 |

契约烟测（无活栈）：`pnpm test:contract`。
