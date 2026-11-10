# iot-edge-agent

现场边缘进程：标准协议接入、环形缓存、本地阈值、**公版 Controller Kit**、**Scene Kernel**、命令执行。不替代 ThingsBoard；上行走 TB MQTT。

验证等级见 [spec/compatibility-matrix.md](../spec/compatibility-matrix.md)。本仓仿真器通过即为 `protocol-verified`。厂商型号须实机后才标 `hardware-verified`。

```bash
pnpm --dir iot-edge-agent test
node sim/ocpp-sim.mjs
node sim/modbus-sim.mjs
node sim/opcua-sim.mjs
node sim/gps-sim.mjs
node sim/esp32-kit-sim.mjs
EDGE_PROTOCOLS=ocpp16,modbus-tcp,opcua,gps,esp32-mqtt node src/index.mjs
```

| 模块 | 说明 |
|------|------|
| `src/protocols/` | OCPP JSON、Modbus TCP/RTU、OPC UA 订阅过滤、GPS 信封、ESP32 Kit MQTT |
| `src/kits/catalog.mjs` | 公版控制器目录（`spec/kits/`）与双路径认领 |
| `src/scene/kernel.mjs` | 手动 / 策略自动 / AI；互锁 fail closed |
| `src/sdk/connector.mjs` | 连接器 SDK；方言只写 Pack adapters |
| `src/threshold.mjs` | 断网时本地阈值 |
| `src/identity.mjs` | 站点凭据信封与证书序号轮换 |
| `src/replay.mjs` | 协议录制回放 |
| `src/outbox-client.mjs` | 拉取 Gateway 命令出箱并回执 |
| `sim/` | 可复现仿真器（无活套接字） |

环境变量：`EDGE_PROTOCOLS`、`EDGE_KILL_SWITCH`、`EDGE_STAY`、`EDGE_MTLS`、`EDGE_NODE_ID`、`GATEWAY_BASE_URL`、`GATEWAY_BEARER_TOKEN`、`EDGE_OUTBOX_POLL_MS`（默认 5000）、`EDGE_OUTBOX_TIMEOUT_MS`（默认 8000）。

未设置 `GATEWAY_BASE_URL` 时进程保持仿真：打印状态后退出（`EDGE_STAY=true` 时挂起）。设置后按轮询间隔 `GET /api/v1/edge/commands`，经 `consumeOutbox` 执行（kill switch 回执 `Rejected` / `KILL_SWITCH`），再 `POST /api/v1/edge/commands/receipt`（`outboxId`、`commandRowId`、`status`、`detail`）。`GATEWAY_BASE_URL` 可以是源站（`http://127.0.0.1:13200`）或已经以 `/api/v1` 结尾的 API 根。Gateway 这两条路由需要 Bearer（`iot.device:control`）以及已注册节点的 `X-Edge-Node-Id`（与 `EDGE_NODE_ID` 一致）；拉取只返回该节点 `siteId`/`projectId` 范围内的命令。

Gateway 合同：`Rejected`/`denied` → 命令 `denied`；`Failed`/`error` → `failed`；缺省 status 的 edge 回执按失败处理（不视为成功）。每次成功的 GET 都会增加 outbox attempts；超过 8 次 outbox 标 `dead` 且命令行变为 `failed`。`TB_MODE=fake` 或 `EDGE_INLINE_DISPATCH=true` 时 Gateway 在 dispatch 内完成出箱，拉取结果为空。

公版 Kit 与场景：[spec/controller-kits.md](../spec/controller-kits.md) · [spec/scenes.md](../spec/scenes.md)。  
台架顺序（仿真 → 实机）：[playbooks/controller-bench.md](../playbooks/controller-bench.md)。
