# SyncroBrain 与 LuminaryWorks 生态

> **品牌**：SyncroBrain · **中文名**：万物智脑  
> **组织**：[github.com/syncrobrain](https://github.com/syncrobrain) · **域名**：[syncrobrain.com](https://syncrobrain.com)

规划摘要：[LuminaryWorks/spec/products/syncrobrain.md](https://github.com/LuminaryWorks/LuminaryWorks/blob/main/spec/products/syncrobrain.md)

## 独立价值

厂商可**仅部署 SyncroBrain**：EMQX + ThingsBoard + 控制台 + App 模板，获得不输涂鸦核心能力的开源私有化方案，无需购买 DataLuminary 或 DoerFlow。

## 在 LuminaryWorks 六产品中的位置

| 维度 | 说明 |
|------|------|
| **连接** | 物理设备与云端的 MQTT 管道与多租户大脑 |
| **编排** | iot-console 聚合跳转，不复制兄弟产品业务代码 |
| **AI 差异化** | 对比涂鸦：叠加 DataTalk 大屏、DoerFlow 链上 AI、BlockyEdu 接入辅导 |

```text
Edge ──MQTT──► SyncroBrain ──► 可选：DataLuminary / DoerFlow / VistaRemote / VistaCast / BlockyEdu
```

## 兄弟产品

| 产品 | 官网 | 在 IoT 场景 |
|------|------|------------|
| [LuminaryWorks](https://luminaryworks.dev) | [luminaryworks.dev](https://luminaryworks.dev) | 生态编排、统一身份 |
| [DataLuminary](https://dataluminary.dev) | [dataluminary.dev](https://dataluminary.dev) | DataTalk 设备监控大屏 |
| [BlockyEdu](https://blockyedu.com) | [blockyedu.com](https://blockyedu.com) | ESPHome/MQTT 实验课、工程师 AI 辅导 |
| [DoerFlow](https://doerflow.dev) | [doerflow.dev](https://doerflow.dev) | 设备 Agent 市场与链上收益 |
| [VistaRemote](https://remote.vistacast.dev) | [remote.vistacast.dev](https://remote.vistacast.dev) | 设备远程桌面运维 |
| [VistaCast](https://vistacast.dev) | [vistacast.dev](https://vistacast.dev) | 摄像头 AI 告警（规划） |

## AI 边界

- **产品内**：设备、MQTT、规则引擎、遥测 hook。不自建 IoT LLM 栈。
- **中央平台**：可选摘要 / RAG / quota。事件可桥到 DataLuminary 数据集。
- Entitlement 若尚未登记 `syncrobrain` productCode，先补目录再接线。

权威：[LuminaryWorks/spec/ai-platform.md](https://github.com/LuminaryWorks/LuminaryWorks/blob/main/spec/ai-platform.md)。

## 生态文档

- [LuminaryWorks 宣传站](https://luminaryworks.dev)
- [LuminaryWorks 域名与品牌](https://github.com/LuminaryWorks/LuminaryWorks/blob/main/spec/domain-and-branding.md)
- 本仓愿景：[spec/platform-vision.md](./platform-vision.md)

## 原则

- 登录走 LuminaryWorks 共享 Logto + `@luminaryworks/auth-core`；资源 ACL 用本产品 Casbin（`iot.*`），见 [identity-and-permissions](https://github.com/LuminaryWorks/LuminaryWorks/blob/main/spec/identity-and-permissions.md)  

- 图表**首选 DataTalk**，ThingsBoard Widget 非主路径
- **垂直深耕**：切入大厂不愿做的长尾行业（行业 Decoder + 专属 BI），不争夺消费级通用 IoT
- **数据主权**：支持私有化与贴牌 App，满足 GDPR、NIS2、信创与《数据安全法》诉求
- **不造轮子**：MQTT / 时序 / 规则引擎用 EMQX、ThingsBoard、ClickHouse 等开源栈；自研集中在 iot-gateway 编排与 DataTalk BI
- **初期红线**：B 端低频次采集、明确产业集群客户画像 — 详见 [platform-vision.md §7](./platform-vision.md#7-初期红线规避小平台倒闭的死穴)

> 历史品牌 **LuminaryIoTChain** 指同一产品，已升级为 **SyncroBrain**。
