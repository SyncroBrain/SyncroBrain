# SyncroBrain 商业许可协议（草稿）

**状态：待律师审阅。** 管辖地、税费、出口管制、责任上限须按签约地改写。

本协议授予被许可方在支付订单所列费用的前提下，对 SyncroBrain 自研软件（Gateway、Console、Industry Pack、部署脚本）进行**内部商业使用**的权利。开源默认条款仍为 Polyform Noncommercial 1.0.0；本商业许可是对该非商业默认条款的**付费例外**。

## 1. 授权范围

- 许可软件：订单上的 SKU（`cloud-lite` / `private-single` / `enterprise-ha`）及其中列明的 Pack。
- 席位：不超过离线许可 JSON 中的 `seats` 与 SKU 上限。
- 部署档位：与订单一致。Enterprise HA 的 ThingsBoard 集群能力仅在订单附录写明时提供。
- 被许可方不得：再许可、SaaS 转售自研层、去掉 ThingsBoard NOTICE、将 TB 改名伪称自有内核。

## 2. 第三方

ThingsBoard CE 以 Apache-2.0 提供，版权仍归上游。PostgreSQL 等见 [THIRD-PARTY-NOTICES.md](./THIRD-PARTY-NOTICES.md)。本许可**不**改变上游条款。

## 3. 限制

- 不包含源代码买断、无限次定制、K8s/EMQX，除非附录列出。
- 离线许可文件与 Ed25519 公钥配置是技术控制，**不替代**本协议。破解或伪造许可构成重大违约。

## 4. 期限与费用

期限、币种、付款见订单。逾期可暂停支持；是否远程停用软件由执法模式（`LICENSE_ENFORCEMENT`）与订单共同约定。

## 5. 免责

软件按「现状」提供。间接损失、利润损失排除。责任上限为订单生效日前 12 个月已付许可费（律师可改为当地强制下限）。

## 6. 签署

以订单签字 / 盖章为准。本 Markdown 本身无合同效力。
