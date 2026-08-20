# Build 执行手册（0–8 周）

> **阶段门状态**：Build **已关闭**（见 [build-freeze.md](./build-freeze.md)）。Showcase 已关闭；当前是 [product-iterate.md](./product-iterate.md)。  
> 架构：[spec/architecture.md](../spec/architecture.md)  
> 愿景：[spec/platform-vision.md](../spec/platform-vision.md)

原则（历史）：**先做出可部署的 ThingsBoard CE Cloud Lite，再做传播与首单。** 本阶段交付物是 compose、Pack、模拟器、文档与演示，不是 30 次客户访谈，也不是 EMQX 全家桶。

## 1. 完成定义（Definition of Done）

同时满足才算 Build 退出：

| 项 | 标准 |
|----|------|
| 一键启动 | `deploy` Compose 拉起 TB CE + Gateway PG + Gateway + Console（`--build`；需 MetaRepo 兄弟目录） |
| MQTT | 模拟器经 TB topic 上报，Console/TB 可见遥测 |
| Pack | `cold-lab/0.1-draft` 可加载 Device Profile / Rule / Alarm / Dashboard |
| 告警演示 | 超温（或模拟）产生 TB Alarm，可确认 |
| 产品入口 | Console 能选项目/站点并打开参考工作台或 TB Dashboard 链接 |
| 导出 | 告警或遥测 CSV 至少一种 |
| 文档 | 安装、演示脚本、版本清单 |
| 许可叙事 | README / docs 写明 TB Apache-2.0 与自研 Polyform-NC |

未完成前，不得宣称「Cloud Lite 已发布」。Build 退出后进入 Showcase（传播与可复现安装），不再往 Build 加运行时组件。

## 2. 八周排期

| 周 | 范围 | 不做 |
|----|------|------|
| 1 | Compose：`thingsboard/tb-postgres` + Gateway PG；Gateway Fastify；`GET /health` 探 TB；演示登录（`CASBIN_DEV_OPEN`）。**本机已通**：TB `:9080` / MQTT `:1883`，PG `:5438`，Gateway `:13200` | EMQX、K8s、把 Gateway 塞进 compose |
| 2 | TB 租户/设备 REST；Project/Site/AssetMap ↔ `tbTenantId`/`tbDeviceId`（Gateway 草案 API）。**本机已通**：`POST /projects` 建 TB Tenant，Site → Customer，Asset → Device + MQTT token | 自研设备表替代 TB |
| 3 | MQTT 模拟器走 `v1/devices/me/telemetry`；`GET /assets` + `/telemetry`；Console 映射设备列表。**本机已通**：sim `--once` 后读回 temperature=4.2 | 第二套 topic 协议 |
| 4 | Pack 导入：`cold-lab/0.1-draft` → TB Device Profile + Rule Chain（`POST /projects/:id/packs/apply`）。**本机已通**：Profile `cold-lab-fridge-0.1-draft`，新 Asset 已挂接 | 自研规则引擎 |
| 5 | Alarm 列表/确认（TB Alarm）；`ALARM_WEBHOOK_URL` 通知。**本机已通**：create → list → ack，webhook `delivered:true` | 完整 Incident 内核 |
| 6 | Console 项目向导；`POST /demos/cold-lab` 一键演示。**本机已通**：Project→Pack→Site→Asset + MQTT token | DataTalk、原生 App |
| 7 | 备份/恢复、环境变量目录、离线镜像脚本；告警/遥测 CSV。**本机已通**：`deploy/OPS.md` + `scripts/backup.sh`；`GET /alarms/export.csv`、`GET /assets/:id/telemetry/export.csv` | 商业计费完整实现（开关即可） |
| 8 | 演示脚本录像文字版、安全基线、冻结功能列表。**已交付**：[validation/demo-script.md](./validation/demo-script.md) · [../deploy/SECURITY.md](../deploy/SECURITY.md) · [build-freeze.md](./build-freeze.md) | 新运行时组件 |

## 3. 明确不做（Build）

- EMQX、Timescale 主路径、ClickHouse、Kafka、Kubernetes
- 自研 MQTT Broker / 时序引擎 / 通用规则引擎
- Fork ThingsBoard 改 Logo 当自有产品而不保留 NOTICE
- 把 TB 原生 UI 作为唯一对外品牌（Console 必须有自己的入口）
- AI、链上、Flutter、Decoder 市场
- 以 30 次实验室访谈作为本阶段出门条

## 4. 与 Validation 文档的关系

[validation.md](./validation.md) 及 week-1 作业包保留为 **Showcase / First Revenue 的触达附录**。Build 期间可顺手收集技术买方反馈，但**零访谈不构成停工理由**。

ColdGuard 差距诊断模板仍可用于将来垂直销售，不是本周必做。

## 5. 演示脚本（目标 10 分钟）

完整录像文字版：[validation/demo-script.md](./validation/demo-script.md)。

1. `docker compose up`，打开 Console  
2. 加载 `cold-lab` Pack  
3. 启动模拟器，看到温度曲线  
4. 触发超温，Alarm 出现并可 Ack  
5. 导出 CSV  
6. 说明：运行时是 TB CE；许可与升级走 SyncroBrain  

## 6. 冻结与安全

- 功能边界：[build-freeze.md](./build-freeze.md)  
- 安全基线：[../deploy/SECURITY.md](../deploy/SECURITY.md)  
- 运维目录：[../deploy/OPS.md](../deploy/OPS.md)

## 7. 证据夹

Build 完成物进 git / docs（可公开安装说明）。客户名录与报价仍放 [validation/evidence/](./validation/evidence/)，不提交。
