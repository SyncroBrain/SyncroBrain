# SyncroBrain 规格索引

> **品牌**：[syncrobrain.com](https://syncrobrain.com) · **组织**：[github.com/syncrobrain](https://github.com/syncrobrain)  
> **当前产品**：Cloud Lite — ThingsBoard CE 运行时 + 交付编排。  
> **ColdGuard**：[coldguard.md](./coldguard.md) 是首个 **Reference Pack**，不是唯一可售 SKU。

| 文档 | 说明 |
|------|------|
| [platform-vision.md](./platform-vision.md) | 交付平台愿景与红线 |
| [architecture.md](./architecture.md) | TB CE + Gateway + Console |
| [plan/README.md](../plan/README.md) | Build → Showcase → First Revenue → Vertical Fit |
| [plan/build.md](../plan/build.md) | **当前**：8 周工程手册 |
| [coldguard.md](./coldguard.md) | 参考 Pack：实验室冷藏 |
| [industry-pack.md](./industry-pack.md) | Pack 制品与 `cold-lab` 默认值 |
| [reliability.md](./reliability.md) | 垂直场景 SLO（Build 先用 TB Alarm） |
| [device-domain.md](./device-domain.md) | 领域模型；v0.1 Device API；TB 映射 |
| [ecosystem.md](./ecosystem.md) | 独立可售；兄弟产品可选 |
| [licensing.md](./licensing.md) | 自研 Polyform-NC；TB Apache-2.0 |
| [design/v0-prompts.md](./design/v0-prompts.md) | Console / 官网原型 |
| [plan/validation.md](../plan/validation.md) | 附录：渠道触达（不阻塞 Build） |
| [contracts/README.md](../contracts/README.md) | 已发布 v1 vs 草案 |
| [syncrobrain/docs](https://github.com/syncrobrain/docs) | 对外文档站 |
| [LuminaryWorks/spec/products/syncrobrain.md](https://github.com/LuminaryWorks/LuminaryWorks/blob/main/spec/products/syncrobrain.md) | 生态摘要（冲突时以本仓为准） |

禁止对外引用裸 M1–M5、VibeEdu/VibeAgent、或「自研核心已 Apache/MIT」。

## 身份与权限

| 层 | 决策 |
|----|------|
| AuthN | Logto OIDC 或演示登录；私有化可接客户 IdP。Audience `https://api.iotchain.local` |
| AuthZ | 产品内 Casbin `iot.*`（JWT 不带业务 ACL） |
| TB | Gateway 使用 TB 服务账号调用 REST；终端用户尽量不直接持有 TB 系统管理员 |

实现：`iot-gateway` `@luminaryworks/auth-core` + Casbin；控制台 PKCE（`:5180`）。不自研通用 IAM。

## Build 权限（最小）

| 权限码 | 说明 |
|--------|------|
| `iot.tenant:manage` | 项目/租户 |
| `iot.site:view` / `iot.site:manage` | 站点 |
| `iot.asset:view` / `iot.asset:manage` | 映射 TB 设备/资产 |
| `iot.device:view` / `iot.device:manage` / `iot.device:control` | 遗留 v0.1 + RPC（须审计） |
| `iot.pack:apply` | 应用 Industry Pack（Build 新增；未实现不得写入已发布 OpenAPI） |

## Vertical Fit 权限（不阻塞 Build）

`iot.incident:*`、`iot.calibration:*`、`iot.report:*`、`iot.audit:view` 等见历史 ColdGuard 表，随行业内核启用。

长期扩展：`iot.rule:edit`、`iot.template:publish`、`iot.ai:subscribe`、`iot.chain:earn` 仍不进入 Build。

## 阶段门

| 阶段门 | 一句话 |
|--------|--------|
| Build | 可部署 TB Cloud Lite |
| Showcase | 文档与演示可被陌生人复现 |
| First Revenue | 第一笔许可或部署费 |
| Vertical Fit | 3 个项目共用一个 Pack |
