# SyncroBrain 与 LuminaryWorks 生态

> **品牌**：SyncroBrain · **中文名**：万物智脑  
> **组织**：[github.com/syncrobrain](https://github.com/syncrobrain) · **域名**：[syncrobrain.com](https://syncrobrain.com)  
> **可售产品**：[ColdGuard](./coldguard.md) 独立成交；兄弟产品均为可选集成。

规划摘要（生态仓）：[LuminaryWorks/spec/products/syncrobrain.md](https://github.com/LuminaryWorks/LuminaryWorks/blob/main/spec/products/syncrobrain.md)。若该摘要仍写全家桶、链上或裸里程碑，**以本仓规格为准**。

## 独立可售

客户可**只买 ColdGuard**：Cloud Lite（EMQX + 领域服务 + PostgreSQL/Timescale + Web），获得多品牌冷藏合规监控与事件闭环。

- **不需要**同时采购 DataLuminary、DoerFlow、VistaRemote、VistaCast、BlockyEdu。
- **不需要**默认部署 ThingsBoard。
- Entitlement 登记 `syncrobrain` productCode 是**收费 SKU 上线门槛**，不是「先接齐 LuminaryWorks 全家桶才能卖」。
- 不成交不推兄弟产品。

历史表述「EMQX + ThingsBoard + App 模板 = 开源涂鸦」已废止。

## 在 LuminaryWorks 产品家族中的位置

口径：**SyncroBrain + 五家兄弟产品**。不要写成互相冲突的「五产品 / 六产品」。LuminaryWorks 是组织与共享身份层，不计入可售 SKU 数。

| 维度 | 说明 |
|------|------|
| **连接 / 合规楔子** | ColdGuard：站点、资产、告警闭环、校准、审计 |
| **编排** | 控制台可链到兄弟产品，但不复制其业务代码，也不是成交前提 |
| **可选增强** | DataTalk 大屏、BlockyEdu 课程、VistaRemote 远程桌面 — Repeatability/Platform 按合同启用 |

```text
边缘网关 ──MQTT──► SyncroBrain ColdGuard（可独立运行）
                         └── 可选：DataLuminary / DoerFlow / VistaRemote / VistaCast / BlockyEdu
```

## 兄弟产品（全部可选）

| 产品 | 官网 | 对 ColdGuard 的关系 |
|------|------|---------------------|
| [LuminaryWorks](https://luminaryworks.dev) | [luminaryworks.dev](https://luminaryworks.dev) | 共享身份（Logto）；不是必须同栈部署的业务产品 |
| [DataLuminary](https://dataluminary.dev) | [dataluminary.dev](https://dataluminary.dev) | 可选 DashboardPort；QA 主路径在本产品报告 |
| [BlockyEdu](https://blockyedu.com) | [blockyedu.com](https://blockyedu.com) | 可选工程师培训；不是安装包 |
| [DoerFlow](https://doerflow.dev) | [doerflow.dev](https://doerflow.dev) | 不进入 MVP；禁止作为 ColdGuard 销售话术 |
| [VistaRemote](https://remote.vistacast.dev) | [remote.vistacast.dev](https://remote.vistacast.dev) | 可选网关远程桌面 |
| [VistaCast](https://vistacast.dev) | [vistacast.dev](https://vistacast.dev) | 视频 AI；首年不做 |

旧名 **VibeEdu / VibeAgent** 已废止，分别对应 BlockyEdu / DoerFlow。对外材料不得再出现旧名。

## AI 边界

- **产品内（MVP）**：遥测质量、阈值、告警升级、报告。不自建 IoT LLM，不做链上结算。
- **中央平台**：可选摘要 / RAG / quota，须有客户预算后再接线。
- 计费：Entitlement `syncrobrain` 未登记则**不得上线收费 SKU**；登记后仍不必绑定其他 productCode。

权威：[LuminaryWorks/spec/ai-platform.md](https://github.com/LuminaryWorks/LuminaryWorks/blob/main/spec/ai-platform.md)。

## 原则

- 登录走共享 Logto + `@luminaryworks/auth-core`；资源 ACL 用本产品 Casbin（`iot.*`），见 [identity-and-permissions](https://github.com/LuminaryWorks/LuminaryWorks/blob/main/spec/identity-and-permissions.md) 与 [index.md](./index.md)
- QA 图表与报告**主路径在 ColdGuard**；DataTalk 不是默认依赖
- **垂直深耕**：先一个园区冷藏合规，再扩资产类型；不争夺消费级通用 IoT
- **数据主权**：Cloud Lite 可私有化；默认只回传健康 / 版本元数据且可关闭
- **不造轮子**：Broker / 时序用开源；自研集中在领域内核与 Industry Pack
- **初期红线**：有限资产点、分钟级采样 + 断网保护、明确付钱人 — [platform-vision.md §7](./platform-vision.md#7-初期红线)

## 许可

见 [licensing.md](./licensing.md)。厂商可私有化 ≠ 自研代码 Apache/MIT。

> 历史品牌 **LuminaryIoTChain** 指同一产品，已升级为 **SyncroBrain**。
