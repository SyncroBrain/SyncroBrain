# SyncroBrain 平台愿景 (v2.0)

> **品牌**：[SyncroBrain](https://syncrobrain.com) · **组织**：[github.com/syncrobrain](https://github.com/syncrobrain)（原 LuminaryIoTChain）  
> **定位**：面向受监管物理资产的合规运营系统。长期可长成垂直 IoT 平台；**当前唯一优先交付**是 [ColdGuard](./coldguard.md)。  
> **许可**：自研代码为 [Polyform-NC](./licensing.md)；上游组件遵循各自协议。开源描述协议与迁出能力，不把编排层伪称为 Apache/MIT。

## 1. 我们要解决什么

客户不会为「开源 MQTT + AI + 区块链生态」买单。他们会为少损失、快审计、少人工、可追责买单。

| 痛点 | 第一阶段做法（ColdGuard） |
|------|---------------------------|
| 多品牌冷藏仍靠人工抄表与微信群 | 不更换冰箱，叠加校准传感器与网关，做成可告警、可确认、可追责 |
| 审计取证耗天数 | 站点事件时间线、校准 / 巡检记录与不可变审计日志，数小时可导出 |
| 数据必须留在园区 | Cloud Lite 可私有化为单机档；默认可关闭遥测回传 |
| 大厂不愿做的长尾合规场景 | 行业 Decoder + 冷藏 SOP / 报告包，而不是通用智能家居 |
| 不想被平台锁死 | 标准 MQTT / REST，CSV/API 可迁出 |

白牌出海、多行业 PaaS、硬件厂商「几万块品牌云」是 **Platform 阶段以后**的选项，不是首屏承诺。

## 2. 楔子与长期平台

```text
ColdGuard（实验室冷藏合规）
    → 冷藏资产 OS（校准、维修、能耗、多园区）
    → SyncroBrain 平台（第二垂直仅在复用 ≥70% 内核后解锁）
```

| 现在做 | 以后才做 |
|--------|----------|
| 单一产业集群、固定场所、20–200 个冷藏资产点 | 医院招标、运输车队、消费级设备 |
| QA 工作台、告警闭环、月度合规报告 | Agent 市场、链上收益、视频 AI |
| Industry Pack 版本化 | 面向所有协议的低代码 Decoder 市场 |
| 渠道安装与认证 BOM | 全国投放与 20 种语言 |

第二垂直必须复用至少 70% 的资产模型、告警闭环、合规报告与渠道。优先顺序：食品冷库 → 危化品环境监控 → 工业设施状态；白牌消费 IoT 最后。

## 3. 与涂鸦（Tuya）的差异（当前可对外说的）

| 维度 | 涂鸦 | SyncroBrain（现阶段） |
|------|------|----------------------|
| 商业模式 | 闭源 SaaS，偏设备/流量 | **可私有化**的垂直合规系统；按受保护资产点 + 工作流 + SLA 收费 |
| 能力边界 | 设备管理、场景联动 | **告警闭环、校准、审计取证**；不把 AI/链上写成 MVP |
| 锁定 | 平台与 App 绑定 | 标准 MQTT + REST，数据可导出 |
| 客户 | 广谱智能硬件 | 明确产业集群内的 QA / 实验室运营 |

DataTalk 大屏、BlockyEdu 课程、DoerFlow、VistaRemote 是**可选兄弟能力**，不是 ColdGuard 成交前提。见 [ecosystem.md](./ecosystem.md)。

## 4. 护城河（以及不是护城河的东西）

| 真正的护城河 | 不是护城河 |
|--------------|------------|
| 产业集群与设备 / 校准渠道 | EMQX、ThingsBoard、React、NestJS |
| 经验收的 Industry Pack、兼容矩阵、交付工具链 | 「接入很多协议」但没有可复用工作流 |
| 告警—确认—处置—结果的标注数据 | 无标签的通用 AI 异常检测 |
| 进入 QA、巡检、校准、维修与审计的工作流 | 低价私有化源码与无限定制 |
| 云 / 私有化统一升级 | 兄弟产品数量或链上叙事 |

## 5. 核心链路（ColdGuard）

```text
认证传感 / 网关 ──MQTT──► Cloud Lite（领域内核）──API──► QA 工作台 / PWA
                              │
                              ├── 资产 · 策略 · 事件 · 校准 · 审计 · 报告
                              ├── EMQX + PostgreSQL/Timescale（默认）
                              └── ThingsBoard / DataTalk：适配层，按证据启用
```

完整分层见 [architecture.md](./architecture.md)。

## 6. 开源与收费（摘要）

权威：[licensing.md](./licensing.md)、根目录 [LICENSE](../LICENSE)。

- **上游**（EMQX OSS、ThingsBoard CE 等）— 各原协议；可替换基础设施
- **自研领域内核与 Industry Pack** — Polyform-NC；商业使用需许可
- **收费** — 托管云、私有化部署、SLA、托管值守；不按消息量倾销
- **不锁定** — 标准 MQTT + REST，可随时迁出

## 7. 初期红线

新功能若拉高连接频次、重复造轮子、模糊客户边界、或把 AI/链上塞进 MVP，应被拒绝或延后。

### 死穴一：高额云成本与消费级并发

**破局**：不做百万在线的 C 端设备。只做 **B 端高客单价、有限资产点**。冷藏告警需要**分钟级采样与本地断网保护**，「每小时上报」不是教条。

### 死穴二：自己造所有轮子，或默认上全家桶

**破局**：不自研 Broker、时序引擎、通用设备内核。默认 **Cloud Lite**（EMQX + NestJS 领域服务 + PostgreSQL/Timescale + Web）。ThingsBoard / DataTalk / ClickHouse 仅在规模、规则复杂度或合同证明需要时经适配层启用。

### 死穴三：没有付费客户画像

**破局**：每次立项必须能回答服务哪一产业集群、谁付钱、买什么结果。当前答案是生物医药园区实验室冷藏合规，见 [coldguard.md](./coldguard.md)。30 次访谈后仍无 3 家愿付试点费，则换垂直，而不是「做市场教育」。

## 8. 长期可选项（不进入 MVP）

以下能力可保留在架构接口上，**不得**出现在 ColdGuard 首屏、报价单或 v0 主视觉：

- DoerFlow Agent 市场与链上结算
- VistaCast 视频 AI
- 原生 Flutter / React Native App（首年 PWA）
- 多区域主动主动、Kafka、Kubernetes
- 通用低代码规则 / Decoder 市场

## 9. 关联规格

| 文档 | 说明 |
|------|------|
| [coldguard.md](./coldguard.md) | 首款产品：ICP、MVP、定价、停止条件 |
| [architecture.md](./architecture.md) | 领域内核 + Cloud Lite + 适配层 |
| [device-domain.md](./device-domain.md) | Site / Asset / Incident 等模型 |
| [ecosystem.md](./ecosystem.md) | 独立可售与可选集成 |
| [licensing.md](./licensing.md) | 许可边界 |
| [plan/README.md](../plan/README.md) | Validation → Wedge → Repeatability → Platform |
