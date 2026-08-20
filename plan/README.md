# SyncroBrain 工程规划

## 仓库拆解

多仓：MetaRepo + 业务子仓（**私有**）；`docs` 仓可本地草稿，**暂不挂公开站点** — [repository-split.md](./repository-split.md)。清单：[`.meta/manifest.json`](../.meta/manifest.json)。`./init.sh` · `syncrobrain.code-workspace`。

## 阶段门（本仓唯一进度语言）

禁止跨仓裸 `M1`–`M5` / `IoT-M0`–`IoT-M5`。

产品权威：[spec/platform-vision.md](../spec/platform-vision.md) · [spec/architecture.md](../spec/architecture.md)

| 阶段 | 目标 | 产品边界 | 退出门槛 |
|------|------|----------|----------|
| **Build**（已关闭） | 可部署 Cloud Lite | TB CE + Gateway + Console + `cold-lab` | 一键 compose；模拟器；演示脚本 |
| **Showcase**（已关闭） | 内部可演示、双 Pack | `env-lab`；私有安装说明 | 闭门可复现；**不要求**公开 docs 站 |
| **Product Iterate**（当前） | 产品够厚再谈传播 | Console/告警/Pack/运维打磨 | 见 [product-iterate.md](./product-iterate.md) |
| **First Revenue** | 第一笔许可/部署/支持费 | 离线许可、备份、白牌、标准安装 | ≥1 份付费合同 |
| **Vertical Fit** | 从项目中选垂直 | 冻结可复用 Pack | 3 个项目共用 ≥70% 工作流 |
| Repeatability / Platform / Scale | 草案 | — | Vertical Fit 通过后解锁 |

**当前内部状态：Product Iterate。** Showcase 以内部演示关闭；公开 docs 站点**延后**。先完善产品，再评估是否发布文档站。

[validation.md](./validation.md) 为渠道触达附录，不阻塞产品迭代。ColdGuard 实验室访谈清单不作为当前必做。

### 工程证据规则

「已完成」必须同时有：可复现演示脚本、版本清单、部署记录。未 clone `iot-gateway` / `iot-console-web` / `deploy` 时不得主张运行能力。

### 历史脚手架（内部追溯）

| 历史标签 | 当时内容 | 对照 |
|----------|----------|------|
| IoT-M0–M2 | MetaRepo、gateway CRUD、Mosquitto presence | 代码起点 |
| 「Validation 阻塞开发」 | 30 访谈才能写代码 | **已废止** |
| 「Build 默认无 TB、用 EMQX+Timescale」 | Cloud Lite v2 草案 | **已废止**；改 TB CE 默认运行时 |

## 技术栈（Cloud Lite）

| 层 | 默认 | 有证据后 |
|----|------|----------|
| MQTT / 设备引擎 | **ThingsBoard CE** | EMQX 独立平面 |
| 元数据 / 时序 | PostgreSQL（TB 默认） | Timescale / ClickHouse |
| 编排 | iot-gateway Fastify | — |
| 产品 UI | iot-console-web | 可选嵌 TB Dashboard |
| 图表 | TB Dashboard + Console | 可选 DataTalk |

## 前置依赖

- 可选：LuminaryWorks Logto（演示账号可用；私有化接客户 IdP）
- GitHub：[syncrobrain](https://github.com/syncrobrain)
- 收费 SKU：Entitlement `syncrobrain` — [spec/ecosystem.md](../spec/ecosystem.md)
- 首个外部合同前：[spec/licensing.md](../spec/licensing.md) + TB NOTICE/SBOM

## 停止扩核心的条件（Product Iterate / First Revenue）

- 把时间花在公开文档站 / SEO，而不是 Console 与交付体验
- 仍优先替代 TB 内核，而不是打磨主路径
- 连续 3 个付费项目没有可复用 Pack
- 每个客户一个 Git 分支

## 生态文档

| 文档 | 说明 |
|------|------|
| [product-iterate.md](./product-iterate.md) | **当前**：产品打磨，不挂公开 docs 站 |
| [showcase-freeze.md](./showcase-freeze.md) | Showcase 已关闭（内部演示） |
| [showcase.md](./showcase.md) | Showcase 回顾 |
| [build.md](./build.md) | Build 8 周（已冻结） |
| [build-freeze.md](./build-freeze.md) | Build 功能边界 |
| [spec/ecosystem.md](../spec/ecosystem.md) | 独立可售 |
| [spec/licensing.md](../spec/licensing.md) | TB 上游 + 自研 NC |
