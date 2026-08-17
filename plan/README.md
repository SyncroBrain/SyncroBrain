# SyncroBrain 工程规划

## 仓库拆解

多仓架构：**公开 docs**、**私有** MetaRepo 与业务子仓 — 见 [repository-split.md](./repository-split.md)。子仓清单：[`.meta/manifest.json`](../.meta/manifest.json)，初始化：`./init.sh`，IDE：`syncrobrain.code-workspace`。

## 阶段门（本仓唯一进度语言）

**废止**跨仓裸编号 `M1`–`M5` / `IoT-M0`–`IoT-M5` 互指。生态其他仓的 M 编号与本仓历史表**不可比**。路线图按证据解锁，不按日历堆功能。

产品权威：[spec/coldguard.md](../spec/coldguard.md) · [spec/architecture.md](../spec/architecture.md)

| 阶段门 | 商业目标 | 产品边界 | 解锁门槛（证据） |
|--------|----------|----------|------------------|
| **Validation**（0–3 月） | 访谈与设计伙伴；验证付费意愿 | 报告样例、硬件台架、告警 / 审计原型 | ≥30 访谈；≥5 设计伙伴；≥3 家愿付试点费 |
| **Wedge**（3–6 月） | 3 个付费试点，1 个园区 | ColdGuard Cloud Lite；1–2 类传感器；1 个行业包；创始人销售 | 3 家付费；上线 ≤10 工作日；告警到达可验证；转化 ≥60%；至少 1 个可公开案例 |
| **Repeatability**（6–18 月） | 20–50 家站点，渠道开始贡献 | 行业包 v1、标准 BOM、云 / 单机私有化、自动月报 | 软件 ARR ¥3m–8m；部署 <1 天；渠道成交 ≥20% |
| **Platform**（18–36 月→） | 100–300 站点，3 个产业集群 | 冷藏资产 OS：校准、维修、能耗、LIMS/BMS；第二垂直须复用 ≥70% | ARR ¥30m–50m；NRR >105%；最大客户 <20% ARR |

当前内部状态：**Validation**。执行手册：[validation.md](./validation.md)。未满足门槛不得宣称进入下一门。

### 工程证据规则

「已完成」必须同时具备：**可复现演示脚本、版本清单、部署记录**。仅规格 / plan 打勾不能进入融资或客户尽调。本机未 clone `iot-gateway` / `iot-console-web` / `deploy` / `docs` 时，不得对外主张运行能力。

### 历史脚手架（仅内部追溯，不作阶段门）

以下曾用内部编号描述代码起点；**不得**再用于跨仓对齐或对外进度：

| 历史标签 | 当时内容 | 对照 |
|----------|----------|------|
| IoT-M0 | MetaRepo init + 规格 | 文档治理 |
| IoT-M1 | iot-gateway + iot-console-web + SSO | 工程脚手架 |
| IoT-M2 | MQTT presence POC（Mosquitto） | 开发连通性 |
| IoT-M3 及以后（未开始） | 曾计划默认上 TB + DataTalk + 链上/App | **已废止**；改走 Cloud Lite 与上表阶段门 |

## 技术栈演进

| 层 | 现在（开发起点） | Wedge 目标 | 有证据后 |
|----|------------------|------------|----------|
| Pipe | Mosquitto 或 EMQX | **EMQX OSS** | — |
| 领域 | Device CRUD | Site/Asset/Incident 内核 | 适配层启用 TB |
| 时序 | 日志 / PG | PostgreSQL + Timescale | ClickHouse（查询量证明后） |
| Client | iot-console-web | ColdGuard QA Web/PWA | 原生 App 非必须 |
| 图表 | 控制台 | 本产品报告 | 可选 DataTalk |

## 前置依赖

- LuminaryWorks 统一登录可用（私有化稍后支持客户 IdP）
- Identity：`LuminaryWorks/identity` → `./bootstrap.sh`
- GitHub 组织：[syncrobrain](https://github.com/syncrobrain)（原 LuminaryIoTChain）
- 收费 SKU：Entitlement `syncrobrain` productCode — 见 [spec/ecosystem.md](../spec/ecosystem.md)
- 首个外部合同前：[spec/licensing.md](../spec/licensing.md) 定稿 + 第三方许可证清单

## 停止条件

30 次访谈后仍没有 3 家愿付费，或 3 个试点要求完全不同的工作流 → **停止扩功能并更换垂直**。不得用「市场教育需要时间」解释没有购买意愿。

## LuminaryWorks 生态

| 文档 | 说明 |
|------|------|
| [syncrobrain/docs](https://github.com/syncrobrain/docs) | 对外文档站（RsPress，公开仓） |
| [spec/ecosystem.md](../spec/ecosystem.md) | 独立可售与可选集成 |
| [spec/licensing.md](../spec/licensing.md) | 许可边界 |
