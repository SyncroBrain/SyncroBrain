# SyncroBrain × DoerFlow 双向变现

> **状态**：optional addon（**默认关闭**）  
> **不是** Cloud Lite / Build 前置。未设 `DOERFLOW_ENABLED=true` 时 Gateway **必须 no-op**。  
> **契约**：[`doerflow.v1.yaml`](../../contracts/doerflow.v1.yaml) · [schemas](../../contracts/schemas/) · [`gateway.v1.yaml`](../../contracts/gateway.v1.yaml)  
> **实现**：`iot-gateway/src/modules/doerflow`（Fastify）。DoerFlow HTTP 全部集中在 `DoerFlowClient`。  
> **入账合同（DoerFlow 权威）**：兄弟仓 `spec/SYNCROBRAIN_TELEMETRY_CREDIT.md` · 本仓 schema [`doerflow-telemetry-credit.schema.json`](../../contracts/schemas/doerflow-telemetry-credit.schema.json)

Cloud Lite 仍可独立交付。DoerFlow 不进入默认 Compose、不进入默认 SKU 功能表、**不进入 TB MQTT 数据面**。

## 1. 边界

| 产品 | 拥有 | 不拥有 |
|------|------|--------|
| DoerFlow | 作业、报价、链上/账本结算、HMAC invoke、生命周期 | IoT 资产、TB 设备、RPC、许可套餐 |
| SyncroBrain | 项目/站点/资产、Incident、WorkOrder、时间窗 digest、命令 Safety Kernel | 在线价格套餐、逐点计费、跨产品 MQTT 总线 |

- 不共享数据库、不跨仓运行时 import。
- **禁止**把 [`telemetry-envelope`](../../contracts/schemas/telemetry-envelope.schema.json) 或 ThingsBoard MQTT（`v1/devices/me/telemetry`）写成跨产品总线。
- 跨产品信封仅为 **CloudEvents 1.0**。
- 卖方返回 **时间窗摘要 / hash / 引用**，不返回设备 token、MQTT 口令、TB 管理员凭据、原始点序列。
- 回调 **绝不能** 直接执行设备命令，也 **绝不能** 直接 close Incident。任何 command suggestion 必须显式调用现有 ActionPolicy / [Safety Kernel](../ai-autonomy.md)（`evaluateAction`），并仍受 Entitlement + Casbin 约束；允许 ≠ 下发。

## 2. 卖方 offering（固定）

| offeringCode | pricingUnit | 计费对象 | 产出 |
|--------------|-------------|----------|------|
| `syncrobrain.telemetry-digest.v1` | `window` | 一个时间窗 | 聚合 min/max/avg/n + `digestSha256` + `ref` |
| `syncrobrain.incident-report.v1` | `batch` | 一个批次 | Incident 摘要哈希 + 计数 + `ref` |

`productCode` 固定 `syncrobrain`。`readiness` 本阶段为 `lab`。不按遥测点计费。

Provider 注册（Gateway 用集中 client adapter；DoerFlow 路径若未冻结则 fallback）：

`productCode` · `offeringCode` · `sourceTenantId` · `pricingUnit` · `readiness` · `idempotencyKey` · `endpointUrl` · `unitPrice` · `payee`

Invoke：`type=com.doerflow.trading.job.invoke`，头 `X-DoerFlow-Signature: sha256=<hex>`，对 **原始 body** HMAC-SHA256。

## 2.1 设备入账（TB 时间窗 → DoerFlow 账本）

与卖方 invoke **方向相反**：Gateway 在 TB 遥测落入时间窗后，把 **digest + 计数**（不是原始点、不是 MQTT topic）POST 到 DoerFlow，给映射 payee 做链下 `ledger.credit`。

| 项 | 值 |
|----|----|
| DoerFlow 路径 | `POST {base}/integrations/syncrobrain/telemetry-credits` |
| `type` | `com.syncrobrain.telemetry-credit.v1` |
| 鉴权 | M2M `integration.event.submit`（与 `/integrations/events` 相同）；可选 HMAC |
| 幂等 | CloudEvents `id`（推荐 `sb:telemetry-credit:{tenant}:{assetId}:{window.start}`） |
| 功能门 | 仍须 `DOERFLOW_ENABLED=true` + license feature `doerflow`；未开则 **不得** 出站 |
| 本步 | Client 方法 `postTelemetryCredit`；**尚未**挂 TB 时间窗聚合（下一步） |

禁止把 `tbDeviceId` / device token / `series` / TelemetryEnvelope 写入该信封。回调 `com.doerflow.ledger.credited.v1` 只记证据，**不** close Incident，**不** RPC。

## 3. 处置（买方求助）

Incident `open` / `escalated`，或 `needsExternal` 的 WorkOrder，经 **license feature `doerflow`**、租户策略、预算后发出：

| type | 含义 |
|------|------|
| `com.syncrobrain.incident.v1` | 需要外部值守/处置的事件 |
| `com.syncrobrain.work-order.v1` | 需要外部执行的工单（人/Agent） |

POST DoerFlow `{base}/integrations/events`。CloudEvents `data` 含：

`sourceTenantId` · `sourceId` · `severity` · `summary` · `audience` · `budget` · `callbackUrl` · `sourceRef`

幂等键 = CloudEvents `id`（持久 outbox `eventId`）。超时按 `DOERFLOW_RETRY_MAX` 重试。入站 invoke/callback 写入 inbox。

生命周期 callback：`POST /api/v1/integrations/doerflow/callbacks`，HMAC。接受 `com.doerflow.trading.job.settled|voided|failed` 与 `com.doerflow.task.created|correlated`。验签接受连接 invoke secret **或** `DOERFLOW_HMAC_SECRET`（对齐 DoerFlow `TRADING_WEBHOOK_SECRET`）。只更新建议/证据，**不** close Incident，**不** 调 TB RPC。

## 4. 策略与许可

- 项目/租户隔离：`sourceTenantId` 绑定本项目；跨项目 invoke 拒绝。
- 预算：每个出站事件消耗 `budget.units`；超额不再发送。
- 最低严重度：低于 `minSeverity` 的 Incident 不出站。
- 功能门：离线许可 feature `doerflow`（Cloud Lite SKU **不含**）。`LICENSE_ENFORCEMENT=block` 时无此功能则 402/403。
- 操作员 HTTP：Casbin `iot.integration:view|manage`。HMAC 路由无用户 JWT，但不授予 `iot.device:control`。
- M2M：`DOERFLOW_M2M_TOKEN` 或 `client_credentials` 缓存（`DOERFLOW_M2M_TOKEN_URL` + client id/secret）。

## 5. 路径

| 方法 | 路径 | 鉴权 |
|------|------|------|
| GET | `/api/v1/integrations/doerflow/status` | JWT + `iot.integration:view` |
| GET/POST | `/api/v1/integrations/doerflow/connections` | JWT + view/manage |
| POST | `/api/v1/integrations/doerflow/connections/{id}/register` | JWT + manage |
| POST | `/api/v1/integrations/doerflow/invoke` | HMAC |
| POST | `/api/v1/integrations/doerflow/callbacks` | HMAC |

成熟度只宣称 **lab**。链上结算、主网 payee、公开 marketplace 仍属 DoerFlow，不在 SyncroBrain Build。
