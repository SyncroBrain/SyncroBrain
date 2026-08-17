# SyncroBrain 规格索引

> **品牌**：[syncrobrain.com](https://syncrobrain.com) · **组织**：[github.com/syncrobrain](https://github.com/syncrobrain)  
> **当前产品**：[ColdGuard](./coldguard.md) — 实验室冷藏合规监控与事件闭环。SyncroBrain 是长期平台名，不是 MVP 首屏。

| 文档 | 说明 |
|------|------|
| [coldguard.md](./coldguard.md) | 首款可售产品：ICP、MVP、定价、停止条件 |
| [industry-pack.md](./industry-pack.md) | cold-lab Pack 默认阈值、升级矩阵、BOM 原则 |
| [reliability.md](./reliability.md) | SLO、断网、通知、演练、责任边界 |
| [platform-vision.md](./platform-vision.md) | 楔子与长期平台、初期红线 |
| [architecture.md](./architecture.md) | 领域内核 + Cloud Lite + 适配层 |
| [device-domain.md](./device-domain.md) | Site / Asset / Incident 等模型；v0.1 Device API |
| [ecosystem.md](./ecosystem.md) | 独立可售；兄弟产品均为可选 |
| [licensing.md](./licensing.md) | Polyform-NC、商业许可、公开节奏 |
| [design/v0-prompts.md](./design/v0-prompts.md) | QA 工作台 / 官网原型提示词 |
| [plan/README.md](../plan/README.md) | 阶段门总览 |
| [plan/validation.md](../plan/validation.md) | **当前**：0–90 天访谈、诊断、台架证据 |
| [contracts/README.md](../contracts/README.md) | 已发布 v1 vs 遥测信封草案 |
| [syncrobrain/docs](https://github.com/syncrobrain/docs) | 对外文档站（RsPress，公开仓） |
| [LuminaryWorks/spec/products/syncrobrain.md](https://github.com/LuminaryWorks/LuminaryWorks/blob/main/spec/products/syncrobrain.md) | 生态层产品规划（若与本仓冲突，**以本仓 ColdGuard 规格为准**） |

对外材料与融资数据室禁止引用仍写裸 M1–M5、VibeEdu/VibeAgent、或「核心已 Apache/MIT」的旧稿。

## 身份与权限

| 层 | 决策 |
|----|------|
| AuthN | Logto OIDC（`IDP_*` / `VITE_IDP_*`）；Audience `https://api.iotchain.local`；私有化可接客户现有 IdP |
| AuthZ | 产品内 Casbin，命名空间 `iot.*`（JWT 不携带业务 ACL） |
| 规格 | [LuminaryWorks identity-and-permissions](https://github.com/LuminaryWorks/LuminaryWorks/blob/main/spec/identity-and-permissions.md) |

实现：`iot-gateway` `@luminaryworks/auth-core` + `src/modules/casbin`；控制台 OIDC PKCE（`:5180`）。不自研通用 IAM。

## ColdGuard 权限（Wedge 目标）

实现可分批接入；未实现的码不得出现在对外已发布 API 文档中。

| 权限码 | 说明 |
|--------|------|
| `iot.site:view` | 查看站点 / 区域 |
| `iot.site:manage` | 创建与配置站点 |
| `iot.asset:view` | 查看资产与传感点 |
| `iot.asset:manage` | 登记资产 / 网关 / 通道 |
| `iot.incident:view` | 查看事件 |
| `iot.incident:ack` | 确认告警 |
| `iot.incident:escalate` | 升级告警 |
| `iot.calibration:view` | 查看校准证书 |
| `iot.calibration:manage` | 登记 / 更新校准 |
| `iot.report:view` | 查看合规报告 |
| `iot.report:export` | 导出报告与 CSV |
| `iot.audit:view` | 查看审计日志 |
| `iot.tenant:manage` | 租户与角色 |
| `iot.device:view` | **遗留** v0.1 设备列表 |
| `iot.device:manage` | **遗留** v0.1 注册/禁用 |
| `iot.device:control` | **遗留** 指令下发（须同时写 AuditEvent） |

Wedge 角色与权限（实现可分批；无值班表不得「已上线」）：

| 角色 | 权限（最小） |
|------|----------------|
| `oncall_ops` | site/asset/incident 只读 + `iot.incident:ack` |
| `facilities` | 同上 + ack；处置证据 |
| `qa_owner` | 上表 + calibration/report/export + escalate；站点策略覆盖 |
| `auditor` | report/view + audit/view + incident/view（无 ack） |
| `tenant_admin` | `iot.tenant:manage` 与站点开户 |

## 长期扩展权限（不进入 MVP）

| 权限码 | 说明 | 解锁 |
|--------|------|------|
| `iot.rule:edit` | 通用规则编排（超出 Pack 覆盖） | Repeatability 以后 |
| `iot.template:publish` | 模板市场上架 | Platform |
| `iot.ai:subscribe` | 订阅 DoerFlow AI | 有付费需求再开 |
| `iot.chain:earn` | 设备链上收益配置 | 不进入 ColdGuard |

## 阶段门（本仓唯一进度语言）

禁止用裸 `M1` / `M2` / `IoT-M3` 与生态其他仓对齐进度。映射与证据要求见 [plan/README.md](../plan/README.md)。

| 阶段门 | 一句话 |
|--------|--------|
| Validation | 访谈与设计伙伴；验证付费意愿。手册：[plan/validation.md](../plan/validation.md) |
| Wedge | 3 个付费试点，Cloud Lite + ColdGuard |
| Repeatability | 可复制交付与渠道 |
| Platform | 冷藏资产 OS 与第二垂直 |
