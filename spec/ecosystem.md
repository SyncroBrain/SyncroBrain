# SyncroBrain 与 LuminaryWorks 生态

> **品牌**：SyncroBrain · **中文名**：万物智脑  
> **组织**：[github.com/syncrobrain](https://github.com/syncrobrain) · **域名**：[syncrobrain.com](https://syncrobrain.com)  
> **可售产品**：Cloud Lite（私有化 IoT 底座 + Pack + 可选 EdgeAgent + 可选 AI）。ColdGuard 是参考 Pack。兄弟产品全部可选。

规划摘要：[LuminaryWorks/spec/products/syncrobrain.md](https://github.com/LuminaryWorks/LuminaryWorks/blob/main/spec/products/syncrobrain.md)。冲突时**以本仓为准**。

## 独立可售

客户可**只部署 SyncroBrain Cloud Lite**：ThingsBoard CE + PostgreSQL + Gateway + Console。

- **不需要** DataLuminary、DoerFlow、VistaRemote、VistaCast、BlockyEdu
- **需要** ThingsBoard CE 作为默认运行时（上游 Apache-2.0，随交付保留 NOTICE）
- **不需要** 默认 EMQX
- Entitlement `syncrobrain` 是收费 SKU 门槛，不是全家桶前置
- 不成交不推兄弟产品

## 在产品家族中的位置

口径：**SyncroBrain + 五家兄弟产品**。LuminaryWorks 是组织与共享身份，不计入 SKU。

```text
设备 ──MQTT──► ThingsBoard CE ──► SyncroBrain Gateway/Console
                                      └── 可选：DataLuminary / DoerFlow / VistaRemote / VistaCast / BlockyEdu
```

| 产品 | 对 Cloud Lite 的关系 |
|------|----------------------|
| [LuminaryWorks](https://luminaryworks.dev) | 可选共享 Logto |
| [DataLuminary](https://dataluminary.dev) | 可选大屏；默认用 TB Dashboard |
| [BlockyEdu](https://blockyedu.com) | 可选培训 |
| [DoerFlow](https://doerflow.dev) | 不进入 Build |
| [VistaRemote](https://remote.vistacast.dev) | 可选 |
| [VistaCast](https://vistacast.dev) | 视频 AI；首年不做 |

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
