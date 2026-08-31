# SyncroBrain 规格索引

> **品牌**：[syncrobrain.com](https://syncrobrain.com) · **组织**：[github.com/syncrobrain](https://github.com/syncrobrain)  
> **当前产品**：Cloud Lite — ThingsBoard CE + Pack Factory + 领域内核 + 可选 Edge/AI。  
> **ColdGuard**：[coldguard.md](./coldguard.md) 是首个 **Reference Pack**，不是唯一可售 SKU。  
> **当前阶段**：[production-scope.md](./production-scope.md) Multi-Vertical Production。

| 文档 | 说明 |
|------|------|
| [platform-vision.md](./platform-vision.md) | 交付平台愿景与红线 |
| [architecture.md](./architecture.md) | TB CE + Gateway + Console |
| [production-scope.md](./production-scope.md) | **当前**：生产范围、非目标、责任 |
| [slo.md](./slo.md) | SLO 与故障演练 |
| [release-gates.md](./release-gates.md) | L1 / E2E / 协议 / AI 安全出门门 |
| [multi-vertical.md](./multi-vertical.md) | Pack 目录与二开约定 |
| [ai-autonomy.md](./ai-autonomy.md) | 产品 AI / 自治包络 |
| [edge-agent.md](./edge-agent.md) | 标准协议边缘 |
| [compatibility-matrix.md](./compatibility-matrix.md) | protocol vs hardware 验证 |
| [plan/README.md](../plan/README.md) | 阶段门 |
| [plan/product-iterate.md](../plan/product-iterate.md) | Cloud Lite 打磨（已齐） |
| [plan/showcase.md](../plan/showcase.md) | Showcase（已关闭） |
| [coldguard.md](./coldguard.md) | 参考 Pack：实验室冷藏 |
| [industry-pack.md](./industry-pack.md) | Pack 制品与 `cold-lab` 默认值 |
| [reliability.md](./reliability.md) | 垂直场景 SLO（Build 先用 TB Alarm） |
| [device-domain.md](./device-domain.md) | 领域模型；v0.1 Device API；TB 映射 |
| [ecosystem.md](./ecosystem.md) | 独立可售；兄弟产品可选 |
| [licensing.md](./licensing.md) | 自研 Polyform-NC；TB Apache-2.0 |
| [design/v0-prompts.md](./design/v0-prompts.md) | Console / 官网原型 |
| [plan/validation.md](../plan/validation.md) | 附录：渠道触达（不阻塞 Build） |
| [contracts/README.md](../contracts/README.md) | 已发布 v1 vs 草案 |
| [syncrobrain/docs](https://github.com/syncrobrain/docs) | 文档仓（可本地草稿；**暂不挂公开站点**） |
| [LuminaryWorks/spec/products/syncrobrain.md](https://github.com/LuminaryWorks/LuminaryWorks/blob/main/spec/products/syncrobrain.md) | 生态摘要（冲突时以本仓为准） |

禁止对外引用裸 M1–M5、VibeEdu/VibeAgent、或「自研核心已 Apache/MIT」。

## 身份与权限

| 层 | 决策 |
|----|------|
| AuthN | Logto OIDC 或演示登录；私有化可接客户 IdP。Audience `https://api.iotchain.local` |
| AuthZ | 产品内 Casbin `iot.*`（JWT 不带业务 ACL） |
| TB | Gateway 使用 TB 服务账号调用 REST；终端用户尽量不直接持有 TB 系统管理员 |

实现：`iot-gateway` `@luminaryworks/auth-core` + Casbin；控制台 PKCE（`:15180`）。不自研通用 IAM。

## Build 权限（最小）

| 权限码 | 说明 |
|--------|------|
| `iot.tenant:manage` | 项目/租户 |
| `iot.site:view` / `iot.site:manage` | 站点 |
| `iot.asset:view` / `iot.asset:manage` | 映射 TB 设备/资产 |
| `iot.device:view` / `iot.device:manage` / `iot.device:control` | 遗留 v0.1 + RPC（须审计） |
| `iot.pack:apply` | 应用 Industry Pack（Build 新增；未实现不得写入已发布 OpenAPI） |

## Vertical Fit 权限（不阻塞 Build）

`iot.incident:*`、`iot.calibration:*`、`iot.report:*`、`iot.audit:view`、`iot.command:dispatch`、`iot.ai:run`、`iot.edge:manage` 随领域内核启用。

长期扩展：`iot.rule:edit`、`iot.template:publish`、`iot.chain:earn` 仍不进入本阶段。

## 阶段门

| 阶段门 | 一句话 |
|--------|--------|
| Build | 可部署 TB Cloud Lite |
| Showcase | 内部可演示；不要求公开 docs |
| Product Iterate | 产品打磨；闭门试点准备（表项已齐） |
| Multi-Vertical Production | Pack + 领域内核 + Edge + AI + OEM（当前） |
| First Revenue | 第一笔许可或部署费（触达可延后） |
| Vertical Fit | 3 个项目共用一个 Pack 并冻结 1.0 |
