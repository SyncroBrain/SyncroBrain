# SyncroBrain 架构 (v3.0)

> **核心逻辑**：ThingsBoard CE 是可替换的 IoT 运行时；SyncroBrain 拥有 Pack、项目交付、许可与产品入口。  
> **默认交付（Cloud Lite）**：ThingsBoard CE + PostgreSQL + iot-gateway（NestJS/Fastify）+ iot-console-web。  
> **Build 阶段不含**：EMQX、Timescale 独立路径、DataTalk、Kafka、K8s。见 [platform-vision.md](./platform-vision.md)、[plan/build.md](../plan/build.md)。

## 1. 分层总览

```text
┌─────────────────────────────────────────────────────────────────────┐
│  产品体验层                                                          │
│  SyncroBrain Console · 项目入口 · Pack 配置 · 白牌主题                │
│  ColdGuard 为参考工作台；不把 TB 原生 UI 当对外主品牌                 │
├─────────────────────────────────────────────────────────────────────┤
│  交付与编排层（SyncroBrain 自研，NestJS + Fastify）                    │
│  Project/Site · Industry Pack · 许可/Entitlement · IdP 编排          │
│  TB 模板生成（Device Profile / Rule Chain / Dashboard）               │
│  安装 · 升级 · 备份 · 演示脚本                                        │
├─────────────────────────────────────────────────────────────────────┤
│  IoT 运行时（ThingsBoard CE，可替换）                                  │
│  MQTT Transport · Device/Asset · Telemetry/Attributes · RPC          │
│  Rule Engine · Alarm · Dashboard · 多租户                             │
├─────────────────────────────────────────────────────────────────────┤
│  数据层                                                               │
│  PostgreSQL（TB 实体 + 时序，Build 默认）                              │
│  Gateway 元数据可同库分 schema 或独立库                                │
├─────────────────────────────────────────────────────────────────────┤
│  设备与模拟器                                                         │
│  MQTT 设备 / 官方模拟器 / Pack 演示脚本                                │
└─────────────────────────────────────────────────────────────────────┘
```

**边界**：ThingsBoard 拥有设备运行时事实（连接、遥测、属性、RPC、TB Alarm）。SyncroBrain 拥有项目、Pack 版本、商业许可、交付记录。Build 阶段可直接使用 TB Alarm；出现不可复用的行业闭环后再升格为 Gateway 内 Incident。

## 2. 部署档位

| 档位 | 适用 | 最小栈 | 何时启用 |
|------|------|--------|----------|
| **Cloud Lite** | 演示、评估、首单私有化 | TB CE + PG + Gateway + Console | **立即（Build）** |
| **Private Single-node** | 数据不出园 | 同上 Compose；离线许可、备份、可选客户 OIDC | 第一个付费私有化客户 |
| **Enterprise HA** | 多节点 / 合同 SLA | TB 集群、对象存储；按需 EMQX / DataTalk | SLO 或合同触发，不提前上 |

本地开发可用 TB 官方 docker 单体。Mosquitto 仅作历史 POC，**不是**生产 MQTT 平面。

## 3. 职责边界

| 组件 | 拥有 | 不拥有 |
|------|------|--------|
| **ThingsBoard CE** | MQTT 接入、设备/资产、遥测、属性、RPC、Rule Chain、Alarm、基础看板 | Pack 版本、商业许可、安装编排、SyncroBrain 品牌主 UI |
| **PostgreSQL** | TB 实体与默认时序；Gateway 元数据 | 企业级独立 BI |
| **iot-gateway** | Pack 应用、项目/站点映射、TB REST 客户端、Entitlement、OIDC/Casbin、交付 API | 替代 TB Transport / Rule Engine |
| **iot-console-web** | 项目入口、Pack 向导、部署状态、参考 Pack 工作台 | 复制 TB 全部 Widget 编辑器 |
| **EMQX** | — | **Build 不部署**。仅当客户已有 Broker、或 TB Transport 不够时经适配加入 |
| **DataTalk** | 可选大屏 | 默认依赖 |

HTTP 服务继续使用 NestJS + **Fastify**（`FastifyAdapter`）。

Gateway 调 TB 使用官方 REST / WebSocket，不 fork TB 源码进产品。白牌只改 SyncroBrain Console；分发 TB 时保留 Apache-2.0 NOTICE 与商标约束，见 [licensing.md](./licensing.md)。

## 4. Build 必须具备

- Compose 一键起 TB + PG + Gateway + Console
- TB 租户/设备与 SyncroBrain Project/Site 的映射表（`tbTenantId` / `tbDeviceId`）
- Pack 能生成或导入：Device Profile、Root Rule Chain、Alarm、Dashboard JSON
- MQTT 设备模拟器（TB 标准 topic：`v1/devices/me/telemetry` 或 `v2/t`）
- 一个通知出口：Webhook，或 TB 通知 + Gateway 转发（企微/钉钉/SMS 择一）
- CSV 导出遥测与告警
- 演示脚本、版本清单、备份/恢复步骤
- `cold-lab` 参考 Pack 可一键加载

字段与遗留 Device API：[device-domain.md](./device-domain.md)。Pack：[industry-pack.md](./industry-pack.md)。

## 5. 有证据后再引入

- EMQX 独立 MQTT 平面（客户已有 Broker、或连接规模/合同要求）
- Timescale / ClickHouse 作为主时序（PG 优化后仍不达标）
- DataTalk 大屏（客户愿为跨站点分析付费）
- Kafka、微服务、Kubernetes、多区域主动主动
- 自研规则引擎或替代 TB Alarm 的完整 Incident 内核
- 原生 App、AI Agent 市场、链上结算

## 6. 数据流（Cloud Lite）

### 6.1 上行

```text
设备 ──MQTT──► ThingsBoard CE Transport
                    │
                    ├── 写入 PG 时序 / 属性
                    ├── Rule Chain → Alarm
                    └── Gateway 经 REST/WS 读遥测与告警，映射到 Project/Site
```

### 6.2 下行

```text
Console ──REST──► Gateway ──TB REST RPC / shared attributes──► Device
```

Pack 应用与 RPC 须写 Gateway 审计日志（谁在何时对哪个 TB 设备下发）。

### 6.3 Topic

Build 以 **ThingsBoard MQTT API** 为准，不发明第二套生产 topic。

| Topic | 方向 | 说明 |
|-------|------|------|
| `v1/devices/me/telemetry` 或 `v2/t` | ↑ | TB 标准遥测 |
| `v1/devices/me/attributes` 或 `v2/a` | ↑↓ | 属性 / 影子 |
| `v1/devices/me/rpc/...` 或 `v2/r/...` | ↓↑ | RPC |
| `iot/v1/{deviceId}/presence` | ↑ | **遗留** POC；Build 不再作为生产路径 |

参考：[ThingsBoard MQTT API](https://thingsboard.io/docs/reference/mqtt-api/)。

当前 HTTP 合同仍为 [`contracts/device.v1.yaml`](../contracts/device.v1.yaml)。Gateway 新 API 另开合同，禁止静默破坏 v1。信封草案仅用于 Pack 内部规范化，不是设备必须实现的第二协议。

## 7. Cloud Lite compose（Build 目标）

```text
docker compose (deploy/)
├── thingsboard-ce    # image: thingsboard/tb-postgres；host HTTP :19080 → 容器 9090；MQTT :1883
│                     # Week 1：镜像内嵌 TB 用 PostgreSQL（volume syncrobrain_tb_data）
├── postgres          # Gateway iot_core（:5438）；日后可与 TB 同实例分库
├── iot-gateway       # :13200 Fastify；调 TB REST（Compose 默认；改代码时可宿主机 pnpm dev）
└── iot-console-web   # :15180 产品入口（Compose 默认）

可选（非 Build）：
├── emqx              # 仅合同触发
├── redis / minio
└── DataTalk

外部身份：
└── Logto 或客户 IdP
```

## 8. 阶段对照

权威阶段见 [plan/README.md](../plan/README.md)。禁止裸 `M1`–`M5` 跨仓对齐。

| 阶段 | 架构范围 |
|------|----------|
| **Build**（已关闭） | Cloud Lite：TB CE + Gateway + Console + `cold-lab` Pack |
| **Showcase**（已关闭） | 内部可演示、`env-lab`；私有安装说明；**不挂**公开 docs 站 |
| **Product Iterate**（当前） | Console / 告警 / Pack / 运维打磨；闭门试点准备 |
| First Revenue | 离线许可、备份、白牌主题、标准安装包 |
| Vertical Fit | 从付费项目冻结垂直 Pack；必要时升格 Incident |
| Repeatability+ | EMQX/HA/DataTalk 按证据启用 |

历史 IoT-M1/M2（gateway CRUD、Mosquitto presence）只是代码起点，**不是** Cloud Lite 完成。

## 9. 参考

- [ThingsBoard CE](https://thingsboard.io/docs/) · [MQTT API](https://thingsboard.io/docs/reference/mqtt-api/)
- [plan/build.md](../plan/build.md) — 8 周工程
- [coldguard.md](./coldguard.md) — 参考 Pack
- [licensing.md](./licensing.md) — TB Apache-2.0 与自研 Polyform-NC
