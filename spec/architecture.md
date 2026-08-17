# SyncroBrain 架构 (v2.0)

> **核心逻辑**：领域产品在上，开源基础设施在下；适配层可替换。  
> **默认交付**：ColdGuard Cloud Lite，不是 EMQX + ThingsBoard + DataTalk 全家桶。  
> **场景约束**：B 端有限资产点、可审计告警；分钟级采样与断网保护 — 见 [platform-vision.md §7](./platform-vision.md#7-初期红线)、[coldguard.md](./coldguard.md)。

## 1. 分层总览

```text
┌─────────────────────────────────────────────────────────────────────┐
│  行业体验层                                                          │
│  ColdGuard Web / PWA · QA 工作台 · 报告 · 渠道 / 白牌主题              │
│  不暴露 ThingsBoard 原生 UI                                          │
├─────────────────────────────────────────────────────────────────────┤
│  领域护城河层（SyncroBrain 自研，NestJS）                              │
│  Asset/Site · Policy · Incident/Ack/Escalation · SOP/Work Order      │
│  Calibration · Audit Log · Report · Billing/Entitlement · Pack       │
├─────────────────────────────────────────────────────────────────────┤
│  设备平台适配层                                                       │
│  DeviceTwinPort · TelemetryPort · RulePort · DashboardPort           │
│  ThingsBoard / DataTalk 是适配器，不进入领域对象                       │
├─────────────────────────────────────────────────────────────────────┤
│  数据与消息层                                                         │
│  EMQX · PostgreSQL + TimescaleDB（先）· 对象存储 · Outbox             │
│  ClickHouse 仅在真实查询量证明后引入                                   │
├─────────────────────────────────────────────────────────────────────┤
│  边缘与设备层                                                         │
│  认证硬件伙伴 · 本地环形缓存 · 本地阈值 · 断网续传 · 校准证书           │
└─────────────────────────────────────────────────────────────────────┘
```

**关键纠偏**：ThingsBoard 不是业务事实源；DataTalk 不是操作工作台。资产、站点、合规政策、事件、处置、校准、报告与计费必须在 SyncroBrain 领域模型中。

## 2. 部署档位（共用同一领域内核）

| 档位 | 适用客户 | 最小数据面 | 何时启用 |
|------|----------|------------|----------|
| **Cloud Lite** | 中小实验室 / 付费试点 | EMQX + 模块化 NestJS + PostgreSQL/Timescale + Web（无 TB/DataTalk） | **立即**；MVP/试点默认栈 |
| **Private Single-node** | 数据不出园区 | 同上经 Docker Compose；离线许可、备份恢复、可选本地 OIDC | 第一个明确付费的私有化客户 |
| **Enterprise HA** | 多园区 / 严格 SLA | 按需经适配层加 TB/DataTalk 集群、区域数据面、对象存储 | SLO/吞吐或合同触发后，不提前上全家桶 |

本地开发可用 Mosquitto 代替 EMQX 做连通性 POC；生产与试点目标是 EMQX。这是环境差异，**不是**跨仓里程碑编号。

## 3. 职责边界

| 组件 | 拥有 | 不拥有 |
|------|------|--------|
| **领域服务（iot-gateway 演进）** | 租户/站点/资产、策略、事件状态机、校准、审计、报告、许可校验 | Broker、通用设备引擎内核 |
| **EMQX** | MQTT 连接、TLS、认证钩子、桥接、限流 | 业务状态、审计真实性 |
| **PostgreSQL + Timescale** | 领域实体 + 近期时序 | 企业级全量 BI |
| **ThingsBoard CE** | 可选 DeviceTwin/Rule 适配 | ColdGuard 事实源、QA UI |
| **DataTalk** | 可选大屏 / 数据集适配 | 告警确认与审计导出主路径 |
| **iot-console-web** | ColdGuard QA 工作台、报告、站点扩容 | 原生 App、兄弟产品业务 |
| **边缘网关** | 本地缓存、本地阈值、续传、签名配置 | 云端计费与多租户策略真源 |

HTTP 服务继续使用 NestJS + **Fastify**（`FastifyAdapter`），见仓库 NestJS 规则。

## 4. 必须现在设计进去

- 层级：租户 → 组织 → 站点 → 区域 → 资产 → 传感点
- 每条遥测携带 `tenantId` / `siteId` / `assetId` / `channelId` / `schemaVersion` / `eventTime` / `quality`
- 幂等接入、乱序/迟到数据、时钟偏差、离线补传与数据质量标记
- 告警状态机、升级策略、值班表、确认人、处置证据、不可变审计日志
- Industry Pack 版本化：Schema、Decoder、阈值、SOP、报告、Dashboard、BOM
- 控制面 / 数据面分离；私有化默认只回传健康与版本元数据且可关闭
- 对象存储用于报告 PDF 与归档；审计事件只追加

字段与状态机：[device-domain.md](./device-domain.md)。

## 5. 有证据后再引入

- Kafka、微服务拆分、Kubernetes、多区域主动主动
- ClickHouse 作为主时序路径
- 默认同开 ThingsBoard + DataTalk 全家桶
- 通用 Agent 市场、区块链结算、视频 AI
- 面向所有协议的低代码 Decoder 市场
- 原生 Flutter / React Native App
- 自研通用 IAM（保留 Logto/OIDC；私有化支持客户现有 IdP）

## 6. 数据流（Cloud Lite）

### 6.1 上行

```text
认证传感 / 网关 ──MQTT──► EMQX ──► 领域服务
                              │
                              ├── 写入 Timescale（遥测，含 quality）
                              ├── Policy 判定 → Incident 状态机
                              └── Outbox → 通知通道（企微/钉钉/SMS 等）
```

启用 TB 适配器时：EMQX 可桥接 ThingsBoard，但 **Incident / Calibration / AuditEvent 仍以领域库为准**。

### 6.2 下行

```text
QA 工作台 ──REST──► 领域服务 ──MQTT（EMQX）──► 网关 / 传感配置（签名）
```

RPC 与阈值下发必须留下 AuditEvent。不得把「控制台点一下」变成无记录变更。

### 6.3 Topic 契约（演进）

现网 / 开发仍可能出现两类 topic。领域层必须能映射到 Asset / SensorChannel，而不是把 ThingsBoard token 当作主键。

| Topic | 方向 | 说明 |
|-------|------|------|
| `iot/v1/{deviceId}/presence` | ↑ | 当前设备 POC；Wedge 映射到网关 / 资产在线 |
| `iot/v1/{deviceId}/telemetry` | ↑ | 当前设备 POC；须演进为带信封的传感点遥测 |
| `v1/devices/{token}/telemetry` | ↑ | 仅当 TB 适配器启用 |
| `v1/devices/{token}/attributes` | ↑↓ | 仅当 TB 适配器启用 |
| `coldguard/v1/{tenantId}/{siteId}/{assetId}/telemetry` | ↑ | **目标**信封 topic（Wedge 起逐步切换） |

当前 HTTP 合同仍为 [`contracts/device.v1.yaml`](../contracts/device.v1.yaml)。领域 API 升级另开合同版本，禁止静默破坏 v1。

## 7. Cloud Lite compose（目标）

```text
docker compose (deploy/)
├── emqx                 # :1883 MQTT, :8083 WS
├── postgres+timescale   # 领域 + 时序
├── redis                # 会话 / 限流 / 通知去重
├── object-store         # 报告与归档（可 MinIO）
├── iot-gateway          # :13100 领域服务（Fastify）
└── iot-console-web      # :5180 ColdGuard Web

可选（合同或 SLO 触发）：
├── thingsboard-ce       # 经 DeviceTwinPort
└── DataTalk             # 经 DashboardPort

外部身份：
└── Logto 或客户 IdP     # OIDC；私有化可关闭遥测回传
```

## 8. 阶段对照（禁止裸 M 编号跨仓）

工程脚手架（Mosquitto presence、控制台 SSO）只说明当前代码起点，**不是**商业阶段门完成。权威阶段门见 [plan/README.md](../plan/README.md)。

| 阶段门 | 架构范围 |
|--------|----------|
| Validation | 报告样例、硬件台架、告警/审计原型；不扩全家桶 |
| Wedge | Cloud Lite + 1 个 Industry Pack + 1–2 类传感器；告警闭环可演练 |
| Repeatability | 标准 BOM、租户模板、云 / 单机私有化、自动月报 |
| Platform | 适配层启用 TB/DataTalk/区域数据面；第二行业包 |

## 9. 参考

- [coldguard.md](./coldguard.md) — 产品边界
- [device-domain.md](./device-domain.md) — 领域模型
- [licensing.md](./licensing.md) — 许可与依赖
- [EMQX](https://www.emqx.io/) · [ThingsBoard CE](https://thingsboard.io/docs/) — 可选 / 上游
