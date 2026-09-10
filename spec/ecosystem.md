# SyncroBrain 与 LuminaryWorks 生态

> **品牌**：SyncroBrain · **中文名**：万物智脑  
> **组织**：[github.com/syncrobrain](https://github.com/syncrobrain) · **域名**：[syncrobrain.com](https://syncrobrain.com)  
> **可售产品**：Cloud Lite（私有化 IoT 底座 + Pack + 可选 EdgeAgent + 可选 AI）。ColdGuard 是参考 Pack。兄弟产品全部可选。

规划摘要：[LuminaryWorks/spec/products/syncrobrain.md](https://github.com/LuminaryWorks/LuminaryWorks/blob/main/spec/products/syncrobrain.md)。冲突时**以本仓为准**。

## 独立可售

客户可**只部署 SyncroBrain Cloud Lite standalone**：ThingsBoard CE + **独立 PostgreSQL** + Gateway + Console。这四件是全部必需项，拓扑权威见 [deployment.md](./deployment.md)。

- **不需要** DataLuminary、DoerFlow、VistaRemote、VistaCast、BlockyEdu（全部为可选 addon，默认关闭）
- **需要** ThingsBoard CE 作为默认运行时（上游 Apache-2.0，随交付保留 NOTICE）
- **需要** Gateway 领域库与 TB 内嵌 PG **实例分离**（TB `/data` 恢复会整卷覆盖）
- **不需要** 默认 EMQX、不需要 LuminaryWorks Entitlement 控制面（`ENTITLEMENT_MODE=off` 默认）
- **可选组件 down 不得让 standalone unready**：`/ready` 只对 control manifest 里 `required` 的组件 fail closed
- Entitlement `syncrobrain` 是收费 SKU 门槛，不是全家桶前置
- 不成交不推兄弟产品

Entitlement 四模式（`off` / `shadow` / `enforce` / `offline_license`）与外部 OIDC 见 [deployment.md §6–§7](./deployment.md#6-entitlement-模式)。Entitlement 永不替代 Casbin，也永不替代 Safety Kernel。

## 在产品家族中的位置

口径：**SyncroBrain + 五家兄弟产品**。LuminaryWorks 是组织与共享身份，不计入 SKU。

```text
设备 ──MQTT──► ThingsBoard CE ──► SyncroBrain Gateway/Console
                                      └── 可选：DataLuminary / DoerFlow / VistaRemote / VistaCast / BlockyEdu
```

| 产品 | 对 Cloud Lite 的关系 |
|------|----------------------|
| [LuminaryWorks](https://luminaryworks.dev) | 可选共享 Logto |
| [DataLuminary](https://dataluminary.dev) | **可选大屏；默认用 TB Dashboard**。Console iframe host 与 pull-mode export 已交付，**仍默认关闭**（`DATALUMINARY_EMBED_ENABLED` 默认 `false`）。启用时必须短期 embed token + origin/dashboard 白名单，浏览器不持凭据。DataLuminary 产品本身不随 Cloud Lite 打包。见 [integrations/smart-site.md](./integrations/smart-site.md) |
| [BlockyEdu](https://blockyedu.com) | 可选培训；实体课见 [education-bridge.md](./education-bridge.md) |
| [DoerFlow](https://doerflow.dev) | **可选双向变现**，**默认关闭**，**不进入 Build / Cloud Lite 默认栈**。未设 `DOERFLOW_ENABLED` 时 Gateway 必须 no-op。契约见 [integrations/doerflow.md](./integrations/doerflow.md) |
| [VistaRemote](https://remote.vistacast.dev) | 可选；`remote-device ↔ asset` 绑定为 **integration-verified**（SyncroBrain 只存 id）。远控会话仍在 VistaRemote，**绝不会**自动建立。任何 remote intervention 仍过 Casbin + ActionPolicy / Safety Kernel |
| [VistaCast](https://vistacast.dev) | 可选视频 AI。签名 `alert.v1` Webhook 进 Incident/Scene；Cloud Lite 仍可单独部署。界面点击路径见 [playbooks/vistacast-bridge.md](../playbooks/vistacast-bridge.md)，契约见 [integrations/vistacast.md](./integrations/vistacast.md) |

旧名 VibeEdu / VibeAgent 已废止。

## AI 边界

产品 AI 使用 `@luminaryworks/ai-client` 连接**外部**模型（`AI_MODE=off|local|central`），与 DataLuminary / BlockyEdu 同一合同。详见 [ai-autonomy.md](./ai-autonomy.md)。

- 不自研大模型；不计费登记 `syncrobrain` 不得上线收费 SKU
- `AI_MODE=off` 时监控、Pack、告警、命令、私有化仍可用
- LLM 不得删除资源、任意 RPC 或绕过 Safety Kernel
- 可选审阅（`pnpm acceptance:evidence`）不是产品功能、不是默认 CI 门

## 原则

- 登录：Logto 或演示账号；Casbin `iot.*`
- 不造运行时轮子：设备/遥测/规则用 TB CE
- 自研集中在 Pack、交付、许可、产品入口
- 红线：8 周冻结运行时；有限点位；不锁协议 — [platform-vision.md §7](./platform-vision.md#7-初期红线)

> 历史品牌 **LuminaryIoTChain** 已升级为 **SyncroBrain**。
