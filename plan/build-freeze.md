# Build 冻结功能列表（Week 8）

> 本文件是 Build 退出的**功能边界**。未列项默认不做，直至 Showcase / First Revenue 另开阶段门。  
> DoD 总表：[build.md](./build.md) §1 · 演示：[validation/demo-script.md](./validation/demo-script.md) · 安全：[../deploy/SECURITY.md](../deploy/SECURITY.md)

## 冻结纳入（In）

| 能力 | 证据 |
|------|------|
| Compose：TB CE + PG + Gateway + Console | `deploy/docker-compose.dev.yml` · 8080 / 1883 / 5438 / 13200 / 5180 |
| Gateway Fastify + health 探 TB | `iot-gateway` `:13200` |
| Project / Site / AssetMap ↔ TB Tenant / Customer / Device | Gateway API |
| `cold-lab/0.1-draft` Pack 应用 | Device Profile + Rule Chain |
| MQTT 模拟器 → TB telemetry | `pnpm mqtt:sim` |
| Console：登录、资产、告警 Ack、一键演示、项目向导 | `:5180` |
| Alarm 列表 / 创建 / Ack / Clear + webhook | TB Alarm |
| CSV：告警 + 资产遥测 | `/alarms/export.csv` · `/assets/:id/telemetry/export.csv` |
| 备份 / 恢复 / 离线镜像 / 环境变量目录 | `deploy/OPS.md` + `scripts/*` |
| 演示脚本录像文字版 | `plan/validation/demo-script.md` |
| 安全基线（改密、CASBIN、网络） | `deploy/SECURITY.md` |
| 许可叙事 | TB Apache-2.0 NOTICE + 自研 Polyform-NC |

## 冻结排除（Out — Build 不交付）

- EMQX、自研 MQTT Broker、Timescale/ClickHouse/Kafka、Kubernetes  
- 完整商业计费 / Entitlement 接线（仅文档占位）  
- 强制生产 IdP（演示 JWT + `CASBIN_DEV_OPEN` 仅限开发）  
- 自研通用规则引擎 / Incident 内核替代 TB Alarm  
- 原生 App、Flutter、Decoder 市场、AI、链上  
- Fork TB 换皮且去掉 NOTICE  
- 以 30 次客户访谈作为出门条  

## 已知限制（可出门，须口头说明）

- 迭代代码时需 `stop iot-gateway iot-console` 再宿主机 `pnpm dev`（端口冲突）  
- Compose 无 TLS；公网试点需反代  
- Pack Dashboard JSON 可后续补强；当前以 Profile + Rule + Console 为主演示面  
- `CASBIN_DEV_OPEN=true` 不可用于生产  

## 退出判定

§1 DoD 表全部勾选，且本文件 In/Out 无争议，即可关闭 **Build** 门，进入 **Showcase**（传播与首单触达），不再往 Build 加运行时组件。
