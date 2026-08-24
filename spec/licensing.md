# SyncroBrain 开源边界与商业许可

> **状态**：Build 规格；**首个外部商业合同前必须法律审阅**。  
> **权威许可文本**：根目录 [LICENSE](../LICENSE) — Polyform Noncommercial License 1.0.0。  
> 禁止把自研编排层写成 Apache/MIT。ThingsBoard CE **是** Apache-2.0 上游，必须保留 NOTICE，且**不混授**成 SyncroBrain 许可。

## 1. 当前事实

| 对象 | 许可 | 含义 |
|------|------|------|
| MetaRepo、iot-gateway、iot-console-web、website、deploy、Pack 制品 | **Polyform-NC 1.0.0** | 非商业可用；商业使用需 SyncroBrain 许可 |
| 对外 docs | 可本地草稿；**暂不挂站** | 不改变代码 NC 约束 |
| OpenAPI contracts | 随 MetaRepo | 不构成商业使用权 |
| **ThingsBoard CE** | **Apache-2.0**（核对发布版本） | 可商用、可分发；保留版权/NOTICE；注意 ThingsBoard **商标**（不可把改 Logo 的 TB 冒充无关产品而不披露来源） |
| PostgreSQL | PostgreSQL License | |
| EMQX OSS | 仅在启用时列入 | **Build 默认不交付** |

## 2. 开源与收费分层

| 层 | 策略 | 不做什么 |
|----|------|----------|
| TB 运行时 | 随私有化交付 CE 二进制/镜像 + NOTICE | 删除版权、把 TB 改名当自有开源内核 |
| 协议与迁出 | 标准 MQTT / REST；可导出 | 私有协议锁数据 |
| Gateway / Console / Pack | 商业许可 + 年支持 | 低价卖断源码、无限定制 |
| 部署与 SLA | 按项目/年收费 | 按 MQTT 消息量倾销 |

收费 SKU 前须登记 Entitlement `syncrobrain`。见 [ecosystem.md](./ecosystem.md)。

## 3. 源码公开节奏

1. **现在**：代码私有（NC）；安装权威在 `deploy/INSTALL.md`。docs 可本地草稿，**不挂公开站点**。
2. **Product Iterate 满意后 / First Revenue**：再评估是否公开安装说明与 compose 示例（不含商业 Pack 密钥）。
3. Gateway 是否改 Apache-2.0：仅董事会评估后；默认不开核心编排。
4. Industry Pack 默认不开源。

## 4. 合同前第三方清单（Cloud Lite）

| 组件 | 预期 SPDX（须核对版本） | 备注 |
|------|-------------------------|------|
| ThingsBoard CE | Apache-2.0 | 必交付；NOTICE + 商标 |
| PostgreSQL | PostgreSQL License | |
| NestJS / Fastify / React | MIT 为主；跑 license checker | copyleft 则替换 |
| Logto 客户端 | 上游 | 可换客户 IdP |
| EMQX / Timescale / TB PE 功能 | 仅启用时列入 | CE 没有的 Integration 勿写进合同能力 |

另须：SBOM、「是否改过 TB 源码」记录（Build 目标：**不 fork 进产品**，REST 集成）。

## 5. 可以卖 / 不可以暗示

| 可以卖 | 不可以暗示 |
|--------|------------|
| 商业许可、部署、年支持、Pack、白牌 Console | 「整个栈都是我们的 Apache 开源」 |
| 使用 TB CE 的私有化 | 「这是我们自研的设备引擎」且不披露 TB |
| 数据导出与标准 MQTT | 永久无偿服务、无限再分发自研代码 |

## 5.1 Product Iterate 占位（非合同效力）

| 接口 / 配置 | 说明 |
|-------------|------|
| `GET /api/v1/branding` | 白牌标题 / Logo / 主题色（`BRAND_*` 环境变量） |
| `GET /api/v1/license` | 离线许可状态；`enforcement: report_only`，**不阻断** |
| `POST /api/v1/license/activate` | 写入 `LICENSE_FILE`（默认 `data/license.json`）；无验签 |
| `samples/license.stub.json` | 示例许可 JSON；`productCode` 必须为 `syncrobrain` |

后续 Entitlement 产品码仍为 `syncrobrain`；本占位不得对外表述为已计费。

## 6. 尽调材料

LICENSE + 本文件 + SBOM + 演示脚本/版本/部署记录。缺证据不得进融资数据室。

## 7. 关联

[LICENSE](../LICENSE) · [architecture.md](./architecture.md) · [playbooks/repository-visibility-policy.md](../playbooks/repository-visibility-policy.md)
