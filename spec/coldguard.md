# SyncroBrain ColdGuard（Reference Pack）

> **状态**：Build 参考实现（`cold-lab/0.1-draft`），**不是**当前唯一可售产品。  
> **角色**：证明 Industry Pack（Profile、Rule、Alarm、Dashboard、SOP）如何把 TB 运行时变成行业方案。  
> **可售主产品**：Cloud Lite 交付平台，见 [platform-vision.md](./platform-vision.md)。垂直商业化在 **Vertical Fit** 阶段由真实项目决定。

## 1. 演示承诺（非销售承诺）

参考场景：30 分钟内演示「多品牌冷藏点位 → 超温告警 → 确认 → 导出」。

真正对实验室 QA 售「合规结果」前，须有付费项目或渠道；**不**再把 30 次访谈当作写代码的前置条件。

## 2. 参考 ICP（将来垂直验证用）

| 维度 | 定义 |
|------|------|
| 场所 | 实验室 / 园区冷藏资产（CRO、IVD、药企研发等） |
| 资产 | 冰箱、冷柜、冷库、网关 |
| 决策者 | 将来：QA；当前演示对象：集成商与企业 IT |
| 避开 | 医院招标、运输车队、消费级设备（仍成立） |

默认阈值与升级矩阵：[industry-pack.md](./industry-pack.md)。可靠性口径：[reliability.md](./reliability.md)（Build 先用 TB Alarm + 一种通知，不强制 72h 网关缓存硬件）。

## 3. Pack 必须能演示

| 能力 | Build 做法 | 垂直产品以后才强制 |
|------|------------|-------------------|
| 温度超阈告警与确认 | TB Rule + Alarm | Incident 状态机、值班升级 |
| 门磁 / 断电 / 离线 | 模拟器或第二通道 | 认证传感器 BOM |
| 仪表盘 | TB Dashboard JSON | QA 合规月报 PDF |
| 导出 | CSV | 不可抵赖审计包 |
| 校准过期 | Pack 字段/属性 | 证书工作流 |

## 4. 商业 SKU（主产品，非 ColdGuard 专属）

Build / First Revenue 卖的是底座，不是冷链订阅：

| 包 | 目的 |
|----|------|
| 非商业评估（Polyform-NC） | 自托管试用 |
| 私有化快速部署 + 培训 | 7 天项目底座 |
| 商业许可 + 年支持 | 升级与二线 |
| Pack 定制 | 仅可复用需求进核心 |
| 白牌 Console | 独立收费 |

实验室「差距诊断 / 30 天试点」价目仍见下表，**仅当**出现该垂直付费意向时启用。

| 商业包 | 建议报价 | 边界 |
|--------|----------|------|
| 合规差距诊断 | ¥3,000–5,000 / 站点 | 签试点可抵扣 |
| 30 天付费验证 | ¥9,800–19,800 / 10 点 | 拒绝免费无限 POC |
| 标准云 / 私有化年费 | 见历史假设 | 按资产点 + 工作流 + SLA |

Entitlement：`syncrobrain` productCode 为收费门槛。见 [ecosystem.md](./ecosystem.md)、[licensing.md](./licensing.md)。

## 5. 领域对象

演示映射：

- TB Device / Asset ↔ SyncroBrain Site / Asset  
- TB Alarm ↔ 演示用告警（Build 不必自研完整 Incident 表）  
- Pack 版本与项目绑定在 Gateway  

完整行业模型（DutyRoster、Calibration、AuditEvent 等）仍以 [device-domain.md](./device-domain.md) 为 **Vertical Fit 目标**，不阻塞 8 周 Build。

## 6. 关联

| 文档 | 说明 |
|------|------|
| [plan/build.md](../plan/build.md) | 当前工程 |
| [architecture.md](./architecture.md) | TB 运行时 |
| [industry-pack.md](./industry-pack.md) | `cold-lab` 默认值 |
| [playbooks/gap-diagnosis.md](../playbooks/gap-diagnosis.md) | 垂直销售模板（非 Build 必做） |
