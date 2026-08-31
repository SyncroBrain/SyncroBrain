# SyncroBrain 生产范围与非目标 (v1.0)

> **状态**：Multi-Vertical Production（当前）。  
> **定位**：连接每一台设备，赋予它一个大脑。  
> **卖点**：功能丰富 · 二开容易 · AI 融合。  
> ColdGuard / `cold-lab` 是首个 Reference Pack，不是唯一可售产品。

## 1. 生产级定义

本阶段「生产级」指以下门槛同时满足，才可对运营与客户演示为 **已交付**：

| 维度 | 门槛 |
|------|------|
| 监控 | 通道遥测入库、质量标记、历史可查 |
| 告警 | 阈值 → Incident 开单 → 确认/升级/关闭；通知失败可审计 |
| 远程操作 | 仅 Pack 声明的命令；幂等、回执、超时、回滚 |
| 部署 | Cloud Lite / Private / HA 可安装；备份恢复演练过 |
| 协议 | 标准协议仿真器通过 → `protocol-verified` |
| 硬件 | 实机实验室通过兼容矩阵 → `hardware-verified` |
| 验收 | L1 + isolated E2E 为出门门；活栈/协议栈为 nightly |

**不得**把未经实机验证的品牌型号写入兼容清单，也不得把 `protocol-verified` 说成「全硬件生产兼容」。

## 2. 首批方向

| 方向 | Pack slug | 生产承诺 | 明确不做 |
|------|-----------|----------|----------|
| 实验室冷藏 | `cold-lab` | 2–8 / −20 / −80 / 冷库；温/门/电/在线；校准；值班；合规 CSV | 医院招标、自研探头 |
| 食品冷库 | `cold-food` | 分区温湿度、门、断电、除霜/能耗、HACCP 证据列 | 替代 WMS |
| 冷链物流 | `cold-logistics` | 车辆/箱体、GPS、围栏、门、温度、冲击、断网补传 | 完整 TMS / 运单清分 |
| 充电桩 | `ev-charging` | 站/桩/枪/会话、OCPP 状态、故障、功率限制、安全启停 | 支付清分、互联互通结算 |
| 储能 | `energy-storage` | PCS/BMS、SOC/SOH、功率、温度、受约束充放电 | VPP / 电力市场 |
| 工业传感器 | `industrial-sensor` | 模拟量/数字量 + 预置量；Modbus/OPC UA/MQTT | 自研 PLC 运行时 |
| 白标 OEM | Console/许可 | 部署级品牌、中英 locale、Pack 白名单、导出包 | 改 TB 商标冒充自有内核 |

## 3. 非目标（首版）

- 支付清分、VPP、电力现货/辅助服务
- TMS/WMS/LIMS 全量替代（只做证据字段与导出）
- 自研 Broker、时序引擎、传感器固件、芯片
- 百万消费级设备、智能家居
- LLM 任意 RPC、任意代码执行、绕过 Casbin / 许可 / Safety Kernel
- 未实机认证的厂商方言宣称「已兼容」

## 4. 责任边界

| 层 | 拥有 | 不拥有 |
|----|------|--------|
| EdgeAgent | 协议、离线缓存、本地阈值、命令执行 | 商业许可、Pack 版本 |
| ThingsBoard CE | MQTT、设备、遥测、基础 Alarm | 行业 Incident、计费、品牌主 UI |
| Gateway | 领域模型、Pack、命令、AI 策略、审计 | 替代 TB Transport |
| AI | 建议与包络内自治动作 | 设备凭据、基础告警唯一依赖 |
| 客户 / 渠道 | 现场安装、校准证书、值班响应 | — |

漏报、通知失败、命令超时必须可审计。AI 超时或策略冲突 **fail closed**，确定性规则与边缘阈值继续运行。

## 5. 阶段关系

| 已完成 | 含义 |
|--------|------|
| Build / Showcase / Product Iterate P0–P2 | Cloud Lite 演示底座 |
| First Revenue P0–P36 | **仅** `cold-lab` + `env-lab` 演示深度，不是多垂直生产完成 |

当前阶段 **Multi-Vertical Production** 完成后，运营可按方向演示真实能力，并标明待实机认证边界。公开 docs 站仍按 [plan/product-iterate.md](../plan/product-iterate.md) 延后。
