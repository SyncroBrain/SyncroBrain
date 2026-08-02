# SyncroBrain 规格索引

> **品牌**：[syncrobrain.com](https://syncrobrain.com) · **组织**：[github.com/syncrobrain](https://github.com/syncrobrain)

| 文档 | 说明 |
|------|------|
| [platform-vision.md](./platform-vision.md) | 平台愿景、大平台缝隙、与涂鸦差异、初期红线（三条死穴） |
| [architecture.md](./architecture.md) | 四层架构 Edge / Pipe / Brain / Client |
| [ecosystem.md](./ecosystem.md) | LuminaryWorks 五产品生态角色 |
| [syncrobrain/docs](https://github.com/syncrobrain/docs) | 对外文档站（RsPress，公开仓） |
| [device-domain.md](./device-domain.md) | 设备域模型与 API |
| [LuminaryWorks/spec/products/syncrobrain.md](https://github.com/LuminaryWorks/LuminaryWorks/blob/main/spec/products/syncrobrain.md) | 生态层产品规划 |

## 身份与权限

| 层 | 决策 |
|----|------|
| AuthN | Logto OIDC（`IDP_*` / `VITE_IDP_*`）；Audience `https://api.iotchain.local` |
| AuthZ | 产品内 Casbin，命名空间 `iot.*`（JWT 不携带业务 ACL） |
| 规格 | [LuminaryWorks identity-and-permissions](https://github.com/LuminaryWorks/LuminaryWorks/blob/main/spec/identity-and-permissions.md) |

实现：`iot-gateway` `@luminaryworks/auth-core` + `src/modules/casbin`；控制台 OIDC PKCE（`:5180`）。

## IoT 权限命名空间

| 权限码 | 说明 |
|--------|------|
| `iot.device:view` | 查看设备 |
| `iot.device:manage` | 注册/删除/分组 |
| `iot.device:control` | 下发指令 |
| `iot.rule:edit` | 规则编排 |
| `iot.tenant:manage` | 租户管理 |
| `iot.template:publish` | 模板市场上架 |
| `iot.ai:subscribe` | 订阅 DoerFlow AI 服务 |
| `iot.chain:earn` | 设备链上收益配置 |
