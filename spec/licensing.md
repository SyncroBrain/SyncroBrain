# SyncroBrain 开源边界与商业许可

> **状态**：Validation 规格；**首个外部商业合同前必须定稿并走法律审阅**。  
> **权威许可文本**：仓库根目录 [LICENSE](../LICENSE) — Polyform Noncommercial License 1.0.0（Polyform-NC）。  
> **决策原则**：对外叙事必须与 MetaRepo 实际许可一致；禁止把自研编排层写成 Apache / MIT。

## 1. 当前事实

| 对象 | 许可 | 含义 |
|------|------|------|
| SyncroBrain MetaRepo、iot-gateway、iot-console-web、website、deploy | **Polyform-NC 1.0.0** | 允许非商业使用；商业使用需另行取得 SyncroBrain 许可 |
| 对外 docs（公开仓） | 文档内容可公开阅读 | 不改变软件代码的 Polyform-NC 约束 |
| OpenAPI contracts | 随 MetaRepo 发布 | 便于对接；不构成商业使用权 |
| EMQX OSS / ThingsBoard CE 等上游 | 遵循**各自上游协议**（常见为 Apache-2.0） | **不混授**；不把上游协议写成本产品许可 |

愿景中的「标准 MQTT + REST、可迁出、可私有化」描述的是**产品承诺与集成边界**，不是把自研代码改成 Apache/MIT。

## 2. 开源与收费分层

| 层 | 策略 | 不做什么 |
|----|------|----------|
| 协议与迁出 | 标准 MQTT / REST；客户可导出 CSV/API | 用私有协议锁数据 |
| 上游开源组件 | 作为可替换基础设施，保持原许可 | 修改上游源码后对外宣称「我们是 Apache 平台」 |
| 领域内核 / Industry Pack / 控制面 | 商业订阅 + 私有化许可 | 低价卖断源码、无限定制 |
| 托管云 / SLA / 托管值守 | 按资产点、工作流与支持收费 | 按消息量打低价云资源战 |

ColdGuard 收费 SKU 上线前须确认 Entitlement 已登记 `syncrobrain` productCode（或等价计费开关）。见 [coldguard.md](./coldguard.md)、[ecosystem.md](./ecosystem.md)。

## 3. 源码公开节奏

对齐 [playbooks/repository-visibility-policy.md](../playbooks/repository-visibility-policy.md)：

1. **现在**：公开 `syncrobrain/docs`；contracts 随 MetaRepo 维护。核心代码保持私有。
2. **Wedge 稳定后评估**：是否公开只读架构说明与认证 BOM（不含领域内核实现）。
3. **iot-gateway 是否改为 Apache-2.0**：仅在董事会明确开放边界、第三方许可证清单和商业许可合同齐备后评估；默认**不**在首年开放核心编排。
4. Industry Pack、告警策略、报告模板、校准工作流默认**不**开源。

文档或融资材料不得把「计划开源」写成「已经 Apache/MIT」。

## 4. 第三方许可证清单（合同前必做）

首个外部商业合同前须完成并归档（Cloud Lite 最小清单；启用 TB 后再补一行）：

| 组件 | 预期 SPDX（须核对当时版本） | 备注 |
|------|------------------------------|------|
| EMQX OSS | Apache-2.0（核对发行版） | 上游，不混授 |
| PostgreSQL | PostgreSQL License | |
| TimescaleDB | 核对社区版 vs 授权版 | 禁止把授权条款写成「我们的 Apache」 |
| NestJS / Fastify / React | MIT 为主；须跑 license checker | copyleft 命中则替换或隔离 |
| Logto 客户端 | 上游许可证 | 私有化可换客户 IdP |
| ThingsBoard CE | 仅在适配器启用时列入 | 默认 Cloud Lite **不**交付 |

另须：私有化 SBOM、NOTICE 保留、「改过哪些上游」记录。

未完成清单前，不得对外签署含开源合规陈述的合同，也不得把冲突文档放入融资数据室。

## 5. 商业许可边界（产品侧）

| 可以卖 | 不可以在合同里暗示 |
|--------|--------------------|
| 云订阅、私有化部署许可、年 SLA、托管值守 | 永久无偿服务、无版本上限的源码移交 |
| 认证硬件渠道整合（硬件合同可转经销商） | SyncroBrain 对传感器精度承担制造商责任（须写清责任边界） |
| 行业包版本升级与远程运维 | 客户把源码交给任意集成商无限再分发 |
| 数据导出与标准协议迁出 | 「开源所以可以商用且无需付费」 |

私有化默认只回传健康与版本元数据，且客户可关闭。见 [architecture.md](./architecture.md)。

## 6. 尽调与对外材料

对外主张「可私有化 / 开源友好」时，必须同时给出：

- 本文件与根目录 `LICENSE`
- 第三方许可证清单与 SBOM（合同前）
- 可复现演示、版本清单、部署记录 — 见 [plan/README.md](../plan/README.md)

缺上述证据时，进度说明只是内部文档，不能进入客户尽调或融资数据室。

## 7. 关联规格

| 文档 | 说明 |
|------|------|
| [LICENSE](../LICENSE) | Polyform-NC 1.0.0 全文 |
| [coldguard.md](./coldguard.md) | 首款可售产品与 SKU |
| [ecosystem.md](./ecosystem.md) | 独立可售；Entitlement 仅收费门槛 |
| [playbooks/repository-visibility-policy.md](../playbooks/repository-visibility-policy.md) | 仓库可见性与公开节奏 |
