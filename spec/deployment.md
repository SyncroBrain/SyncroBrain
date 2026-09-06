# SyncroBrain 部署拓扑（权威）

> **产品**：Cloud Lite。**权威架构**：[architecture.md](./architecture.md)。**生态可选性**：[ecosystem.md](./ecosystem.md)。  
> 本文定义 **standalone 的最小集合**、**compose 文件矩阵**、**control manifest**、**Entitlement 模式** 与 **部署红线**。  
> 实现仓：`deploy/`（compose + 脚本）、`iot-gateway`（health / ready / version）。

## 1. Cloud Lite standalone 定义

**standalone = ThingsBoard CE + iot-gateway + iot-console-web + 独立 PostgreSQL。** 四件套之外的一切都是可选。

| 组件 | 角色 | standalone |
|------|------|-----------|
| ThingsBoard CE | 设备运行时（MQTT / 遥测 / RPC / Alarm / Dashboard） | **必需** |
| iot-gateway | Pack、领域内核、命令、Safety Kernel、TB REST、许可 | **必需** |
| iot-console-web | 产品入口 | **必需**（可换成客户自建前端，但仍需 Gateway） |
| **独立 PostgreSQL** | Gateway `iot_core` 领域库 | **必需**，且与 TB 自带 PG **实例分离** |
| iot-edge-agent | OCPP / Modbus / OPC UA / GPS / ESP32 Kit | **可选** |
| Logto / 客户 IdP | 统一登录 | **可选**（未配置时用演示 / operator 登录） |
| LuminaryWorks Entitlement | 在线订阅控制面 | **可选**（默认 `off`，私有化用 `offline_license`） |
| DataLuminary / VistaCast / DoerFlow / BlockyEdu / VistaRemote | 兄弟产品 | **可选**，默认全部关闭 |
| EMQX / Kafka / Redis / MinIO / K8s | — | **不在 Cloud Lite**，需证据或合同触发 |

### 1.1 独立 PG 是硬要求

Gateway 领域表（Project/Site/Asset/Incident/Command/Audit/Outbox/Integration）**不得**写进 ThingsBoard 自带的镜像内嵌 PostgreSQL：

- TB 升级、`/data` 卷恢复会整卷覆盖，混库等于把领域数据交给 TB 的备份生命周期；
- Gateway 迁移与 TB schema 迁移互不知情，混库会在 TB 大版本升级时炸掉；
- 备份粒度不同：Gateway 用 `pg_dump`（逻辑），TB 用 `/data` 卷 tar（物理）。

允许的形态：compose 自带 `iot-postgres`（默认），或客户托管 PG（[§3 external-db](#3-compose-文件矩阵)）。**不允许**指向 TB 容器内的 PG。

### 1.2 可选组件 down 不得让 standalone unready

`GET /api/v1/ready` 只对 **control manifest 里标 `required` 的组件** fail closed。兄弟产品、Entitlement 在线控制面、Edge、IdP（未配置时）挂掉 → `ready` 仍为 `200`，只在 `optional[]` 里降级标注。见 [§4](#4-control-manifest)。

## 2. 事件平面分离（红线）

**两个平面，永不混用：**

| 平面 | 传输 | Topic / 路径 | 载荷 | 谁可以用 |
|------|------|--------------|------|----------|
| **设备平面** | ThingsBoard MQTT Transport | `v1/devices/me/telemetry` · `v1/devices/me/attributes` · `v1/devices/me/rpc/...`（或 `v2/*`） | TB 原生遥测 / 属性 / RPC | 设备、EdgeAgent、模拟器 |
| **跨产品事件平面** | 独立 broker（`EVENT_BUS_MQTT_URL`）或签名 HTTP Webhook | `lw/v1/{tenantId}/{product}/{eventType}` · CloudEvents over HTTPS | `alert.v1` · `com.syncrobrain.incident.v1` · `syncrobrain.telemetry-digest.v1` … | VistaCast / DoerFlow / DataLuminary / SyncroBrain Gateway |

禁止：

- 把 `alert.v1`、CloudEvents、digest、report 发到 TB MQTT topic，或伪造 TB Alarm；
- 把 `EVENT_BUS_MQTT_URL` 指向 ThingsBoard `:1883`（部署静态检查会拒绝）；
- 把设备 token / MQTT 口令 / TB 管理员凭据放进跨产品信封；
- 让跨产品事件绕过 Gateway 直连 TB REST。

`home-care` 场景的看护载荷 **只能** 走签名 Webhook，禁止上任何 MQTT 平面（见 [integrations/vistacast.md](./integrations/vistacast.md)）。

## 2.1 Safety Kernel 权威

任何来自 AI、兄弟产品（VistaCast / DoerFlow / DataLuminary）、Scene Kernel 或外部事件的**动作建议**，落到设备之前必须依次通过：

```text
建议 → Entitlement（SKU / feature） → Casbin（iot.command:dispatch 等） → ActionPolicy / Safety Kernel evaluateAction → Command Outbox → TB RPC
```

- **Safety Kernel 是唯一权威**：互锁、雨锁、kill switch、速率、包络越界 → fail closed，允许 ≠ 下发。
- 跨产品回调 **不得** 直接调 TB RPC，**不得** 自动 close Incident。
- Entitlement 或 Casbin 任一失败即终止；不得用 JWT 声明绕过 Casbin。
- 浏览器（Console）不持有 TB 凭据、设备 token、集成 secret 或兄弟产品 API key。

## 3. Compose 文件矩阵

`deploy/` 采用「core 模板 + 场景栈 + 叠加层」：每个**场景栈**都能单独 `-f` 使用（内部用 compose `extends` 复用 core），**叠加层**必须跟在场景栈之后。

| 文件 | 类型 | 用途 |
|------|------|------|
| `docker-compose.core.yml` | 模板 | 服务定义唯一来源：镜像、healthcheck、卷。**不含**宿主端口、不含任何默认口令。不单独启动 |
| `docker-compose.dev.yml` | 场景栈 | 本地开发 / 演示：宿主端口全开、`DEPLOY_PROFILE=dev`、显式 dev-only 口令 |
| `docker-compose.prod.yml` | 场景栈 | 生产单节点：所有 secret `${VAR:?}` 必填、**PG 不映射宿主端口**、镜像 tag 必填 |
| `docker-compose.private.yml` | 场景栈 | 兼容别名：继承 prod，`DEPLOY_PROFILE=private` + 离线许可 |
| `docker-compose.ha.yml` | 场景栈 | 应用层 HA（Gateway/Console 多副本 + Caddy），TB CE 仍单节点 |
| `docker-compose.external-db.yml` | 场景栈 | 客户托管 PostgreSQL：**不含** `iot-postgres` 服务 |
| `docker-compose.control-plane.yml` | 叠加层 | 可选外部控制面：Logto / 客户 OIDC、Entitlement `:3040`、兄弟产品；走**共享 docker 网络 DNS** |
| `docker-compose.smoke.yml` | 叠加层 | `smoke` profile：一次性容器跑 health/ready/version 与部署红线断言 |
| `docker-compose.dev-host-bridge.yml` | 叠加层 | **仅 dev**：把 `host.docker.internal` 还给在宿主机跑 Logto/VistaCast 的开发者 |

```bash
# 开发
docker compose -f docker-compose.dev.yml up -d --build

# 生产单节点
docker compose --env-file .env.prod -f docker-compose.prod.yml up -d

# 生产 + 客户托管 PG
docker compose --env-file .env.prod -f docker-compose.external-db.yml up -d

# 生产 + 外部控制面（Entitlement / OIDC / 兄弟产品）
docker compose --env-file .env.prod -f docker-compose.prod.yml \
               -f docker-compose.control-plane.yml up -d

# 冒烟
docker compose -f docker-compose.dev.yml -f docker-compose.smoke.yml \
               --profile smoke run --rm smoke
```

### 3.1 部署红线（`scripts/deploy-static-check.sh` 会拒绝）

| 红线 | 理由 |
|------|------|
| 禁止 `container_name:` | 固定名字让同机多实例、HA 副本、`extends` 失效；脚本必须用 `docker compose ps -q <service>` |
| 禁止 `:latest` / 无 tag 镜像 | 升级不可复现、回滚无锚点；tag/digest 由 `*_IMAGE` 变量注入 |
| 禁止 `host.docker.internal` / `host-gateway`（除 `dev-host-bridge`） | 生产不存在宿主回环；跨产品必须走 DNS + 共享网络 |
| 生产禁止映射 PG 宿主端口 | `:5438` 对外等于把领域库交出去 |
| 生产禁止弱 secret 默认值 | 所有 secret 用 `${VAR:?}`，无 `:-` 兜底 |
| 禁止 `EVENT_BUS_MQTT_URL` 指向 TB `:1883` | 事件平面分离红线 |
| 备份 / 恢复脚本禁止 `|| true` 吞错 | 恢复静默失败 = 数据丢失当成功上报 |

## 4. Control manifest

**Control manifest** 声明「这一套部署里，哪些组件是 required、哪些是 optional」，是 `GET /api/v1/ready` 的唯一判据。

- 契约：[`contracts/schemas/control-manifest.schema.json`](../contracts/schemas/control-manifest.schema.json)
- 加载：`CONTROL_MANIFEST_FILE=/etc/syncrobrain/control-manifest.json`；未设置时 Gateway 用内置 standalone 默认值
- 内置默认：`postgres=required`、`thingsboard=required`、其余全部 `optional`
- `required` 且探测失败 → `/ready` 返回 `503`；`optional` 失败只降级
- manifest **不能** 把兄弟产品声明为 `required` 并同时宣称 standalone —— Gateway 会在 `/ready` 的 `warnings[]` 里标 `MANIFEST_SIBLING_REQUIRED`
- manifest 只描述依赖拓扑，**不授权**任何动作；权限仍是 Casbin + Safety Kernel

```json
{
  "manifestVersion": "1",
  "deployment": { "profile": "prod", "topology": "standalone" },
  "components": [
    { "key": "postgres", "kind": "database", "requirement": "required" },
    { "key": "thingsboard", "kind": "runtime", "requirement": "required" },
    { "key": "entitlement", "kind": "control-plane", "requirement": "optional" },
    { "key": "vistacast", "kind": "sibling-product", "requirement": "optional" }
  ]
}
```

## 5. Gateway 探针

| 端点 | 语义 | 认证 |
|------|------|------|
| `GET /api/v1/health` | **liveness**：进程活着就 `200`。带版本、TB ping、许可摘要、安全警告 | public |
| `GET /api/v1/ready` | **readiness**：按 manifest 判定 `required` 依赖。全绿 `200`，否则 `503` | public |
| `GET /api/v1/version` | 版本 / commit / 部署档位 / manifest 摘要 | public |

三个探针都 **不返回** secret、连接串、token 或口令。

`ready` 契约：

```jsonc
{
  "status": "ready",              // ready | degraded | not_ready
  "checks": {
    "required": [{ "key": "postgres", "state": "up", "latencyMs": 3 }],
    "optional": [{ "key": "entitlement", "state": "skipped", "reason": "MODE_OFF" }]
  },
  "warnings": ["ENTITLEMENT_SHADOW"]
}
```

- `status=degraded` 仍是 HTTP `200`（可选组件降级）
- `status=not_ready` 才 `503`
- compose / K8s 的 readinessProbe 用 `/ready`，livenessProbe 用 `/health`

## 6. Entitlement 模式

Gateway 用 `ENTITLEMENT_MODE` 统一四种形态，默认 **`off`**（Cloud Lite standalone 不依赖任何控制面）：

| 模式 | 行为 | 适用 |
|------|------|------|
| `off` | 不检查、不外呼。所有 feature 视为允许 | 开发、standalone 演示 |
| `shadow` | 检查并审计/上报，**不阻断** | 上线前观察期 |
| `enforce` | 在线检查 Entitlement 控制面；缺权限 → `402/403` | 有中央控制面的托管交付 |
| `offline_license` | 只读本地 Ed25519 签名许可（`LICENSE_FILE`），**不外呼** | 私有化 / 断网 |

- 在线控制面：`ENTITLEMENT_BASE_URL`（默认 `http://entitlement:3040`，**DNS + 共享网络**，不是 `host.docker.internal`），服务凭据 `ENTITLEMENT_SERVICE_KEY`
- `enforce` 且控制面不可达 → 按 `ENTITLEMENT_FAIL_MODE`（默认 `closed`）；`shadow` 永不阻断
- `offline_license` 等价于旧 `LICENSE_ENFORCEMENT=block`，保留向后兼容
- Entitlement **永不**替代 Casbin，也**永不**替代 Safety Kernel

## 7. 外部 OIDC

| 变量 | 说明 |
|------|------|
| `IDP_ISSUER` | 外部 IdP issuer（Logto 或客户 IdP）。留空 → 演示 / operator 登录 |
| `IDP_JWKS_URI` | 可选，容器内可达的 JWKS 地址（issuer 是浏览器可见地址时需要） |
| `IDP_AUDIENCE` | 默认 `https://api.iotchain.local` |
| `IDP_REQUIRED` | `true` 时生产档位拒绝启动在演示 JWT 上 |

生产档位（`prod` / `private` / `ha`）必须二选一：接外部 OIDC，或显式设 `OPERATOR_PASSWORD` 走 operator 登录。两者都缺 → Gateway 拒绝启动。业务 ACL 永远不进 JWT。

## 8. 备份 / 恢复

| 产物 | 方式 | 恢复 |
|------|------|------|
| Gateway `iot_core` | `pg_dump -Fc`（逻辑） | `pg_restore --clean --if-exists`，**失败即 exit ≠ 0** |
| TB `/data` | 卷 tar（物理） | 停 TB → 清卷 → 解包 → 起 TB |

- 脚本用 `docker compose ps -q <service>` 定位容器，不用固定容器名；
- 任何 `pg_restore` / `tar` 失败必须终止并非零退出，禁止 `|| true`；
- 恢复前先 `--list` 校验 dump 可读；
- 备份产物含租户与时序数据，按客户机密保管，不进 git。

## 9. 相关

- [architecture.md](./architecture.md) — 分层与边界
- [ecosystem.md](./ecosystem.md) — 兄弟产品可选性
- [integrations/smart-site.md](./integrations/smart-site.md) — 跨产品绑定参考合同
- [licensing.md](./licensing.md) — 离线许可与 SKU
- `deploy/INSTALL.md` · `deploy/OPS.md` · `deploy/SECURITY.md` · `deploy/HA.md`
