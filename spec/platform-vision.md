# SyncroBrain 平台愿景 (v3.0)

> **品牌**：[SyncroBrain](https://syncrobrain.com) · **组织**：[github.com/syncrobrain](https://github.com/syncrobrain)（原 LuminaryIoTChain）  
> **定位**：基于 ThingsBoard CE 的可交付 IoT 解决方案平台。让集成商与企业技术团队 **30 分钟起演示、7 天内完成私有化项目底座**。  
> **当前阶段**：**Build** — 先做出 Cloud Lite，再找付费项目；垂直行业从真实项目中选出。见 [plan/README.md](../plan/README.md)。  
> **许可**：自研代码为 [Polyform-NC](./licensing.md)；ThingsBoard CE 等上游遵循各自协议。不把编排层伪称为 Apache/MIT。

## 1. 我们要解决什么

技术买方不会从零搭 MQTT、设备影子、规则、告警、仪表盘和私有化运维。他们也不想被涂鸦式闭源平台锁死。

| 痛点 | Build 阶段做法 |
|------|----------------|
| 项目每次从零接设备、规则、看板 | Cloud Lite：TB CE 运行时 + Pack 模板 + 一键 compose |
| 私有化难、升级难、交付不可复现 | 标准安装、备份、版本清单与演示脚本 |
| 行业方案散落在客户分支 | Industry Pack（设备 Profile、Rule Chain、Dashboard、SOP）版本化 |
| 不想被平台锁死 | 标准 MQTT / REST；TB 与 Pack 可迁出 |
| 数据必须留在园区 | 单机私有化；默认可关闭外部遥测 |

**ColdGuard** 是首个 **Reference Industry Pack**（实验室冷藏告警闭环），用来证明 Pack 机制，不是要求先有医药销售渠道。见 [coldguard.md](./coldguard.md)。

## 2. 产品楔子与长期形态

```text
Cloud Lite（TB CE 运行时 + 交付编排）
    → 付费私有化 / 白牌项目
    → 从 3–5 个真实项目中选出垂直 Pack
    → 垂直运营系统（校准、工单、多站点）仅在复用 ≥70% 后解锁
```

| 现在做（Build / Showcase） | 以后才做 |
|---------------------------|----------|
| TB CE + Gateway + Console 可部署演示 | EMQX 独立 Broker（客户已有或规模证明后） |
| `cold-lab` 参考 Pack + 环境监测轻量 Pack | 医院招标、消费级百万设备、链上/AI 市场 |
| 技术买方：集成商、硬件团队、企业 IT | 全国渠道与 20 种语言 |
| 7 天项目底座、商业许可 + 年支持 | 自研设备引擎或替代 TB 内核 |

## 3. 与涂鸦、与裸 ThingsBoard 的差异

| 维度 | 涂鸦 | 裸 ThingsBoard CE | SyncroBrain |
|------|------|-------------------|-------------|
| 商业模式 | 闭源 SaaS | 开源运行时，交付靠自己 | 运行时开源；**交付、Pack、许可、升级**收费 |
| 能力 | 设备与场景 | 设备、规则、告警、看板 | 在 TB 之上做项目化与行业模板 |
| 锁定 | App/云绑定 | 无厂商锁定，但项目不可复制 | 标准 MQTT/REST；Pack 可版本化复用 |
| 客户 | 广谱硬件 | 开发者自运维 | 集成商与企业技术团队 |

DataTalk、BlockyEdu、DoerFlow、VistaRemote 均为可选，不是成交前提。见 [ecosystem.md](./ecosystem.md)。

## 4. 护城河（以及不是护城河的东西）

| 真正的护城河 | 不是护城河 |
|--------------|------------|
| 可复现私有化交付与升级 | ThingsBoard、EMQX、NestJS 本身 |
| 经验收的 Industry Pack 与兼容矩阵 | 「接入很多协议」但没有可复用模板 |
| 从项目需求到 TB 配置的产品化工具链 | 低价卖断源码、无限定制 |
| 云 / 私有化统一版本 | 兄弟产品数量或链上叙事 |

## 5. 核心链路（Cloud Lite）

```text
设备 / 模拟器 ──MQTT──► ThingsBoard CE ──REST/WS──► SyncroBrain Gateway ──► Console
                              │                         │
                              ├── Device / Telemetry    ├── Pack 生成 Profile / Rule / Dashboard
                              ├── Attributes / RPC      ├── 项目 · 站点 · 许可 · 身份
                              └── Alarm / Dashboard     └── 安装、升级、备份编排
```

完整分层见 [architecture.md](./architecture.md)。Build 阶段**不**默认部署 EMQX。

## 6. 开源与收费（摘要）

权威：[licensing.md](./licensing.md)、根目录 [LICENSE](../LICENSE)。

- **上游**：ThingsBoard CE（Apache-2.0）、PostgreSQL 等 — 各原协议；可替换运行时
- **自研**：Gateway、Console、Pack、交付脚本 — Polyform-NC；商业使用需许可
- **收费**：私有化部署、商业许可、年支持、Pack 定制、白牌；不按消息量倾销
- **不锁定**：标准 MQTT + REST；不把 TB 商标改成自有而不保留 NOTICE

## 7. 初期红线

### 死穴一：消费级百万并发与高额云账单

**破局**：B 端项目规模（百～万级点位），不做智能家居百万在线。

### 死穴二：重复造 IoT 运行时，或默认上全家桶

**破局**：设备接入、影子、规则、告警、看板用 **ThingsBoard CE**。不自研 Broker/时序引擎。EMQX、DataTalk、ClickHouse、Kafka、K8s 仅在合同或 SLO 证明后加入。

### 死穴三：无限扩平台、没有可演示的交付物

**破局**：Build 固定 **8 周**。第 8 周后停止增加运行时功能，转向文档、演示与首次交付。连续 3 个付费项目没有共同工作流，不继续扩大核心。

## 8. 长期可选项（不进入 Build）

- EMQX 作为独立 MQTT 平面
- DoerFlow / 链上、VistaCast 视频 AI
- 原生 Flutter / RN App
- 多区域主动主动、Kafka、Kubernetes
- 通用低代码 Decoder 市场
- 把 TB 原生 UI 当客户主工作台（白牌入口走 SyncroBrain Console）

## 9. 关联规格

| 文档 | 说明 |
|------|------|
| [architecture.md](./architecture.md) | TB CE 运行时 + Gateway 交付层 |
| [coldguard.md](./coldguard.md) | 参考 Pack：实验室冷藏 |
| [industry-pack.md](./industry-pack.md) | Pack 制品与 `cold-lab` 默认值 |
| [ecosystem.md](./ecosystem.md) | 独立可售；兄弟产品可选 |
| [licensing.md](./licensing.md) | Polyform-NC 与 TB 上游 |
| [plan/README.md](../plan/README.md) | Build → Showcase → First Revenue → Vertical Fit |
| [plan/build.md](../plan/build.md) | **当前** 8 周工程手册 |
