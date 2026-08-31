# Industry Pack：cold-lab-v1

> **状态**：Cloud Lite Pack Factory（多垂直）。`cold-lab` 仍为参考实现；另有 `env-lab` 证明可替换。  
> **slug**：见 [multi-vertical.md](./multi-vertical.md)  
> **机器可读合同**：[contracts/schemas/pack-manifest.schema.json](../contracts/schemas/pack-manifest.schema.json)

Pack 是版本化制品：改阈值、SOP、报告或 BOM 必须升版本。不能被 3 个客户复用的改动走专业服务，不打进本 Pack。

## 1. 制品清单

| 制品 | Build 演示 | 垂直产品以后 |
|------|------------|----------------|
| TB Device Profile / Rule / Alarm / Dashboard | 是 | 版本冻结 |
| 通道 Schema 与本文阈值 | 是 | 客户覆盖须审计 |
| Decoder / 认证 BOM / 双供应商 | 否 | 有硬件合同时，§6 |
| 值班升级矩阵 | 可选演示 | §4 进合同 |
| 月报 PDF / 完整 SOP | 可选 | Vertical Fit |

## 2. 资产与通道

MVP 资产 `kind`：`fridge` · `freezer_20` · `freezer_80` · `cold_room` · `gateway`。  
`incubator` 不进 v1。能耗、视频不进 v1。

| 通道 `type` | 单位 | 默认采样 | 事件触发 |
|-------------|------|----------|----------|
| `temperature` | °C | 60 s | 超阈持续 ≥2 个采样点 |
| `door` | bool（开=1） | 心跳 60 s + 边沿 | 开启持续超过门开超时 |
| `power` | bool（有电=1） | 边沿 + 60 s | 断电立即开单 |
| `gateway_online` | bool | 60 s | 超过离线窗口无心跳 |

每通道必须能挂 [Calibration](./device-domain.md)；`gateway_online` 无校准证书，总览不显示过期。

## 3. 默认 Policy（可被站点覆盖）

均为**待验证起点**。覆盖必须写进站点 Policy 并留 AuditEvent，且 `packVersion` 可追溯。

| 资产 | 温度正常窗 | 警告带 | 严重 |
|------|------------|--------|------|
| `fridge` | 2.0–8.0 °C | 外侧 0.5 °C 内 | 超出警告带持续 ≥3 min |
| `freezer_20` | −25.0–−15.0 °C | 外侧 1.0 °C | 持续 ≥3 min |
| `freezer_80` | −86.0–−70.0 °C | 外侧 2.0 °C | 持续 ≥3 min |
| `cold_room` | 站点建档时填写；无窗禁止上线 | 同 fridge 逻辑 | 同左 |

| 规则 | 默认 |
|------|------|
| 门开超时 | 180 s（冷库可站点改为 300 s） |
| 网关离线 | 180 s 无心跳 |
| 断电 | 立即 `severity=critical` |
| 开单去重 | 同一 `channelId` 未关闭 Incident 不重复开单 |
| 迟到数据 | `quality=late` 仍可开单，但报告单独标注 |

## 4. 值班与升级矩阵

角色（Casbin 映射见 [index.md](./index.md)）：

| 角色 | 职责 |
|------|------|
| `oncall_ops` | 一线确认（实验室运营 / 值班） |
| `facilities` | 电力、空调、门锁 |
| `qa_owner` | QA；审计与关闭标准 |
| `vendor` | 冰箱/校准供应商（可只收升级副本） |

| 严重度 | 确认 SLA | 超时后 |
|--------|----------|--------|
| critical（断电、ULT 严重超温、网关离线） | 10 min | → `facilities`，再 20 min → `qa_owner` |
| warning（警告带、门开超时） | 30 min | → `facilities` |
| info（校准 30 天内到期） | 下一工作日 | 不打电话；总览徽章 |

通知通道优先级（Wedge 至少落地 2 条，Validation 至少 1 条真实通道）：**企微或钉钉 → SMS**。微信服务号可作为补充，不得作为唯一通道。详情 [reliability.md](./reliability.md)。

值班表是领域对象 `DutyRoster`：站点 × 星期 × 班次 × 角色 × 联系人。无值班表禁止将站点标为「已上线」。

## 5. 报告列（月报 + 演练）

导出 CSV/PDF 至少含：

- 站点、期间、Pack 版本、生成人、生成时间
- 按通道：最高/最低温度、超阈次数、最长超阈时长
- 事件：类型、是否演练、开单/确认/关闭时间、确认人、升级次数
- 校准：证书号、有效期、过期天数
- 通知失败次数
- 数据质量：`backfill` / `late` 占比

**禁止**把原始 MQTT topic 或 ThingsBoard token 作为报告主键。

## 6. BOM 原则（不自研硬件）

- 认证范围内的温度探头 + 网关；**双供应商**，禁止单一 SKU 锁死
- 探头须可出具计量校准证书（第三方校准所）
- 网关：本地环形缓存、本地阈值、TLS MQTT、签名配置
- 不卖自有芯片；硬件合同可走渠道
- 具体型号在首个设计伙伴现场后写入 `cold-lab` v1.0 BOM 表，本草案不虚构 SKU

## 7. 版本冻结规则

| 版本 | 何时 |
|------|------|
| `0.1-draft` | 现在；仅内部与设计伙伴 |
| `1.0` | 3 个付费试点能共用同一套阈值/SOP/报告列 |
| `1.x` | 兼容修订（文案、默认 SLA 微调） |
| `2.0` | 打破通道 Schema 或资产 kind |

机器可读默认值（与本文冲突时以本文为准）：[packs/cold-lab.0.1-draft.json](./packs/cold-lab.0.1-draft.json)。
