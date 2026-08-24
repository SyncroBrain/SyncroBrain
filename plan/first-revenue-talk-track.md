# 报价与年支持话术（内部 · 一页纸）

> First Revenue 触达用。给熟人技术买方闭门演示后使用。  
> **不是**对外官网文案。公开 docs 延后。  
> 许可权威：[../spec/licensing.md](../spec/licensing.md) · 演示：[validation/demo-script.md](./validation/demo-script.md)

## 卖什么

| SKU（口头） | 含 | 不含 |
|-------------|----|------|
| Cloud Lite 许可 | Gateway + Console + Pack 使用权（商业场景） | TB CE 本身（Apache-2.0，随交付） |
| 标准私有化部署 | compose / 陪装 1 次、改密清单、交接包 | K8s、多机房 HA |
| 年支持 | Pack 小版本、告警/导出路径缺陷、工作日响应 | 无限定制、现场驻场、合规认证包 |

金额与币种：**当面谈**；可参考诊断附录量级，但不默认卖冷链诊断。

## 开场三句

1. 设备运行时是 ThingsBoard CE（可审计、Apache-2.0）；项目、Pack、Console、交付是 SyncroBrain（Polyform-NC）。  
2. 今天脚本能复现：双 Pack、遥测、告警 Ack、CSV、版本清单。  
3. 下一步是内网机试点 + 许可/年支持，不是公开文档站，也不是再加 Broker。

## 异议处理

| 对方说 | 回 |
|--------|----|
| 「TB 自己就能用」 | 能。我们卖的是项目/Pack/交付与支持；你仍保留迁出与标准 MQTT。 |
| 「能不能开源整栈」 | 自研层 NC；商业另约。TB 上游保持 NOTICE。 |
| 「要 K8s / EMQX」 | 不进首单范围；单体 Cloud Lite 先跑通。 |
| 「冷链审计呢」 | 另册诊断包；首单默认是 IoT 底座。 |

## 递出物

- `deploy/scripts/pilot-bundle.sh` 或 Console「试点交接包」  
- `INSTALL.md` + 改密口头红线  
- 本页口头报价区间（会后邮件确认，勿口头锁死无限范围）
