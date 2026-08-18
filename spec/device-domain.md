# SyncroBrain 领域模型 (v0.2)

> **状态**：Wedge 目标模型；HTTP v0.1 仍以 [`contracts/device.v1.yaml`](../contracts/device.v1.yaml) 为准  
> **产品边界**：[coldguard.md](./coldguard.md)  
> **实现落点**：iot-gateway 领域模块（NestJS + Fastify）；Casbin 命名空间 `iot.*`

本文把历史「Device CRUD」扩成 ColdGuard 需要的站点 / 资产 / 事件模型。现行 OpenAPI 不在此改；信封草案见 [`contracts/drafts/telemetry-envelope.md`](../contracts/drafts/telemetry-envelope.md)。新 HTTP 合同须另开版本评审。

## 1. 层级

```text
Tenant
  └── Organization
        └── Site
              └── Zone
                    └── Asset          # 冰箱 / 冷柜 / 冷库 / 培养箱
                          └── SensorChannel   # 温度 / 门磁 / 断电 / 网关心跳
```

网关（Gateway）是一种 Asset 或 Asset 附属设备，须能独立表示离线。校准挂在 SensorChannel，不挂在租户级「一台设备」上。

## 2. 实体

### 2.1 组织与场所

| 实体 | 关键字段 | 说明 |
|------|----------|------|
| Tenant | id, name, billingRef | 商业租户；对齐 Entitlement `syncrobrain` |
| Organization | id, tenantId, name | 可对应同一园区内多法人 |
| Site | id, orgId, name, timezone, address | QA 报告与值班的基本单位；无 `DutyRoster` 不得标已上线 |
| Zone | id, siteId, name | 楼层 / 房间 / 冷库分区 |
| DutyRoster | id, siteId, weekday, shift, role, contactRef | 站点 × 班次 × 角色；Ack SLA 按此升级 |

### 2.2 资产与传感

| 实体 | 关键字段 | 说明 |
|------|----------|------|
| Asset | id, siteId, zoneId?, name, kind, vendor, model, status | `kind`: fridge / freezer_20 / freezer_80 / cold_room / gateway（`incubator` 不进 cold-lab v1） |
| SensorChannel | id, assetId, type, unit, schemaVersion, sampleIntervalSec | `type`: temperature / door / power / gateway_online |
| Calibration | id, channelId, certificateRef, validFrom, validTo, vendor | 过期须在总览暴露 |
| Device（遗留） | id, tenantId, externalUserId, name, protocol, status, metadata | v0.1 API 主键；Wedge 映射到 Asset 或 Gateway |

遗留 Device.protocol：`mqtt` \| `modbus` \| `http`。新模型优先描述 SensorChannel，协议细节放 metadata / Pack。

### 2.3 策略、事件与处置

| 实体 | 关键字段 | 说明 |
|------|----------|------|
| Policy | id, siteId, packVersion, rulesJson | 阈值、门开超时、断电、离线；来自 Industry Pack 可覆盖 |
| Incident | id, siteId, assetId, channelId, type, severity, state, openedAt, closedAt | 告警事实；见状态机 |
| Acknowledgement | id, incidentId, actorId, ackedAt, channel | 谁、何时、经哪条通知通道确认 |
| Escalation | id, incidentId, fromRole, toRole, dueAt, firedAt | 超时升级 |
| WorkOrder | id, incidentId, assignee, evidenceUris, resolvedAt | 处置与证据（照片 / 备注 / 维修单） |
| AuditEvent | id, tenantId, actorId, action, entityRef, occurredAt, prevHash? | 只追加；不可改 |
| Report | id, siteId, period, type, storageUri | 月度合规 / 演练报告 |
| IndustryPack | id, slug, version, artifacts | Schema、Decoder、阈值、SOP、报告、Dashboard、BOM |

## 3. 遥测信封

每条遥测（目标合同）必须可映射到层级，并带质量：

| 字段 | 说明 |
|------|------|
| tenantId, siteId, assetId, channelId | 外键；缺失则标记 quality=`unmapped` 入死信而非静默丢 |
| schemaVersion | 与 Industry Pack 对齐 |
| eventTime | 设备侧事件时间 |
| ingestedAt | 平台接收时间 |
| value, unit | 物理量 |
| quality | `ok` \| `late` \| `out_of_order` \| `clock_skew` \| `backfill` \| `unmapped` |
| idempotencyKey | 网关生成；用于补传去重 |

乱序与迟到数据：写入时序时不覆盖较新的 `ok` 点；Incident 判定以 Policy 的窗口定义为准。断网补传必须带 `quality=backfill`。

## 4. Incident 状态机

```text
open → acked → escalated → in_progress → resolved → closed
                 ↑              │
                 └──────────────┘ 未在 SLA 内确认则再次升级
```

| 规则 | 要求 |
|------|------|
| 开单 | 本地阈值或云端 Policy 命中即 `open`；同一 channel + 未关闭 incident 去重 |
| 确认 | Acknowledgement 记录 actor 与通道；未确认不可直接 `closed` |
| 升级 | 值班表 + Policy SLA；每次升级写 Escalation 与 AuditEvent |
| 关闭 | 必须有处置摘要或自动恢复证据；漏报调查另开事件类型，不得删除历史 |
| 演练 | 用 flag 区分演练 Incident，计入到达率，不计入客户损失 KPI |

通知通道（微信 / 企微 / 钉钉 / SMS）属于投递适配器，不是领域状态。投递失败本身要记 AuditEvent，并可开「通知失败」类 Incident。

## 5. 审计

- AuditEvent **只追加**。更正用新事件说明，不 update 旧行。
- 覆盖：登录、策略变更、阈值下发、确认、升级、报告导出、校准证书变更、许可变更。
- 私有化客户可关闭控制面遥测回传；关闭操作本身必须审计。

## 6. API

### 6.1 现行 v0.1（保持兼容）

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| GET | `/api/v1/health` | public | 健康检查 |
| GET | `/api/v1/devices` | `iot.device:view` | 列表 |
| POST | `/api/v1/devices` | `iot.device:manage` | 注册 |
| GET | `/api/v1/devices/:id` | `iot.device:view` | 详情 |

MQTT（开发 POC）：

| Topic | Payload | 说明 |
|-------|---------|------|
| `iot/v1/{deviceId}/presence` | `{"status":"online"\|"offline"}` | 上下线 |
| `iot/v1/{deviceId}/telemetry` | JSON | 当前仅接入；质量信封草案见 `contracts/drafts/telemetry-envelope.md` |

本地模拟：`npm run mqtt:presence -- <device-uuid> online`（在 `iot-gateway`）。

### 6.2 计划中的领域 API（下一合同版本）

以下路径**尚未**写入 OpenAPI，供实现排期，禁止当作已发布合同：

| 方法 | 路径（草案） | 权限 |
|------|----------------|------|
| GET/POST | `/api/v1/sites` | `iot.site:view` / `iot.site:manage` |
| GET/POST | `/api/v1/assets` | `iot.asset:view` / `iot.asset:manage` |
| GET | `/api/v1/incidents` | `iot.incident:view` |
| POST | `/api/v1/incidents/:id/ack` | `iot.incident:ack` |
| POST | `/api/v1/incidents/:id/escalate` | `iot.incident:escalate` |
| GET/POST | `/api/v1/calibrations` | `iot.calibration:view` / `iot.calibration:manage` |
| GET | `/api/v1/reports/:id` | `iot.report:view` |
| POST | `/api/v1/reports/:id/export` | `iot.report:export` |
| GET | `/api/v1/audit-events` | `iot.audit:view` |
| GET/PUT | `/api/v1/sites/:id/duty-roster` | `iot.site:manage` |

完整权限表见 [index.md](./index.md)。

## 7. Industry Pack

权威默认值与冻结规则：[industry-pack.md](./industry-pack.md)。机器可读副本：[packs/cold-lab.0.1-draft.json](./packs/cold-lab.0.1-draft.json)（须与本文一致；冲突以本文为准）。

Pack 是版本化制品，不是控制台里随手改的脚本。不能被 3 个客户复用的改动按专业服务交付，不打进 Pack 主版本。

遥测信封 JSON 草案：[contracts/drafts/telemetry-envelope.md](../contracts/drafts/telemetry-envelope.md)。SLO 与通知：[reliability.md](./reliability.md)。
