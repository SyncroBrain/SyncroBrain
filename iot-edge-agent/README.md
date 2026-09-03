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
| `sim/` | 可复现仿真器（无活套接字） |

环境变量：`EDGE_PROTOCOLS`、`EDGE_KILL_SWITCH`、`EDGE_STAY`、`EDGE_MTLS`。

公版 Kit 与场景：[spec/controller-kits.md](../spec/controller-kits.md) · [spec/scenes.md](../spec/scenes.md)。  
台架顺序（仿真 → 实机）：[playbooks/controller-bench.md](../playbooks/controller-bench.md)。
