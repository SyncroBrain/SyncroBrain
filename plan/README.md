# SyncroBrain 工程规划

## 仓库拆解

多仓：**公开 docs**、**私有** MetaRepo 与业务子仓 — [repository-split.md](./repository-split.md)。清单：[`.meta/manifest.json`](../.meta/manifest.json)。`./init.sh` · `syncrobrain.code-workspace`。

## 阶段门（本仓唯一进度语言）

禁止跨仓裸 `M1`–`M5` / `IoT-M0`–`IoT-M5`。

产品权威：[spec/platform-vision.md](../spec/platform-vision.md) · [spec/architecture.md](../spec/architecture.md)

| 阶段 | 目标 | 产品边界 | 退出门槛 |
|------|------|----------|----------|
| **Build**（0–8 周） | 可部署 Cloud Lite | TB CE + Gateway + Console + `cold-lab` Pack | 一键 compose；模拟器；演示脚本；版本清单 |
| **Showcase**（9–12 周） | 陌生技术团队能装能看 | 文档、视频、第二轻量 Pack | 公开安装教程；可复现演示 |
| **First Revenue**（3–6 月） | 第一笔许可/部署/支持费 | 离线许可、备份、白牌、标准安装 | ≥1 份付费合同（部署或年支持） |
| **Vertical Fit**（6–12 月） | 从项目中选垂直 | 冻结可复用 Pack | 3 个项目共用 ≥70% 工作流 |
| Repeatability / Platform / Scale | 草案 | 见历史商业规划 | 仅 Vertical Fit 通过后解锁 |

**当前内部状态：Build。** 执行手册：[build.md](./build.md)。

[validation.md](./validation.md) 降为 **Showcase 之后的渠道/产品验证附录**（零预算触达与付费信号）。**不再阻塞** 8 周建设。ColdGuard 实验室访谈清单不作为当前必做。

### 工程证据规则

「已完成」必须同时有：可复现演示脚本、版本清单、部署记录。未 clone `iot-gateway` / `iot-console-web` / `deploy` 时不得主张运行能力。

### 历史脚手架（内部追溯）

| 历史标签 | 当时内容 | 对照 |
|----------|----------|------|
| IoT-M0–M2 | MetaRepo、gateway CRUD、Mosquitto presence | 代码起点 |
| 「Validation 阻塞开发」 | 30 访谈才能写代码 | **已废止** |
| 「Build 默认无 TB、用 EMQX+Timescale」 | Cloud Lite v2 草案 | **已废止**；改 TB CE 默认运行时 |

## 技术栈（Build）

| 层 | Build 默认 | 有证据后 |
|----|------------|----------|
| MQTT / 设备引擎 | **ThingsBoard CE** | EMQX 独立平面 |
| 元数据 / 时序 | PostgreSQL（TB 默认） | Timescale / ClickHouse |
| 编排 | iot-gateway Fastify | — |
| 产品 UI | iot-console-web | 可选嵌 TB Dashboard |
| 图表 | TB Dashboard + Console | 可选 DataTalk |

## 前置依赖

- 可选：LuminaryWorks Logto（Build 可用本地/演示账号；私有化接客户 IdP）
- GitHub：[syncrobrain](https://github.com/syncrobrain)
- 收费 SKU：Entitlement `syncrobrain` — [spec/ecosystem.md](../spec/ecosystem.md)
- 首个外部合同前：[spec/licensing.md](../spec/licensing.md) + TB NOTICE/SBOM

## 停止扩核心的条件（Build 之后）

- 8 周到点仍把时间花在替代 TB 内核
- 连续 3 个付费项目没有可复用 Pack
- 每个客户一个 Git 分支

## 生态文档

| 文档 | 说明 |
|------|------|
| [build.md](./build.md) | **当前** 8 周工程 |
| [spec/ecosystem.md](../spec/ecosystem.md) | 独立可售 |
| [spec/licensing.md](../spec/licensing.md) | TB 上游 + 自研 NC |
