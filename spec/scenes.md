# 场景中台（Scene Kernel）

> **状态**：与 [controller-kits.md](./controller-kits.md) 同期。  
> Schema：[scene.schema.json](../contracts/schemas/scene.schema.json)。  
> 边缘实现：`iot-edge-agent/src/scene/kernel.mjs`（断网仍可跑策略自动）。  
> 云编排合同：Gateway `/scenes`、`/commands`；AI 仍走 [ai-autonomy.md](./ai-autonomy.md) Safety Kernel。

场景中台把「手动、策略自动、AI 自动」收成同一条命令管道。垂直 Pack 只提供 **配方**（哪些触发、哪些命令）；真正执行仍是 `CommandDispatcher` → Outbox → Edge → 设备。

```text
触发（手动 RPC / 阈值 / 时间窗 / AI 建议）
        │
        ▼
 Scene Kernel  ──安全包络（Kit + Pack + 站点覆盖）──► 允许则 dispatch
        │                                              否则 deny / fail closed
        ▼
  审计 + 回执；AI 失败不影响阈值与边缘互锁
```

## 1. 三种控制源

| `source` | 谁发起 | 是否要人点 | 失败行为 |
|----------|--------|------------|----------|
| `user` | Console / 远程手动 | 是 | 仍过 Kit 互锁（限位、干转、雨锁） |
| `policy` | 确定性规则（阈值、时间窗、边沿） | 否 | 边缘可独立执行；上云后补审计 |
| `ai` | Autopilot 建议 | 包络内否 | 证据不足、超时、越权、kill switch → **fail closed** |

`scene.mode` 限制允许的 source：

| mode | 允许 |
|------|------|
| `manual` | 仅 `user` |
| `policy` | `user` + `policy` |
| `ai` | `user` + `policy` + `ai`（AI 不得绕过互锁） |

站点可将单条场景降级（例如只允许手动），升级到 `ai` 必须有 Pack `safetyEnvelope.allowlist` 与 ActionPolicy。

## 2. 场景对象

一条 Scene 绑定 **一个资产（或一组同 Kit 资产）** 和 **一个 Pack 配方 id**：

| 字段 | 说明 |
|------|------|
| `id` | 稳定 id（Pack 内唯一） |
| `packSlug` | 所属 Pack |
| `kitSlug` | 执行所用 Kit |
| `mode` | `manual` \| `policy` \| `ai` |
| `enabled` | 关闭则只接受 `user` 且仍过互锁，或完全拒绝（站点策略） |
| `triggers[]` | `command` / `threshold` / `schedule` / `ai` / `external_event` |
| `actions[]` | `commandId` + `params`（必须在 Kit 命令表） |
| `safety` | 叠加 Kit 包络：`maxOnSec`、`interlocks`、`requireEvidence` |

评估结果：`dispatch` \| `hold` \| `deny`。`deny` 必须有 `reason`（`KILL_SWITCH`、`INTERLOCK`、`DRY_RUN`、`NOT_ALLOWLISTED`、`MODE`、`EVIDENCE`…）。

## 3. Pack 预置配方

### 3.1 `smart-window`

| id | 触发 | 动作 | 默认 mode |
|----|------|------|-----------|
| `win-manual` | 用户 `open`/`close`/`setPosition` | 原样 | `manual` |
| `win-rain-close` | `rain=1` | `close` | `policy` |
| `win-heat-vent` | 室温 ≥ 站点阈值 | `setPosition` 到 `ventPct`（默认 30） | `policy` |
| `win-ai-weather` | AI 建议 + 温度或雨量证据 | 仅 `open`/`close`/`setPosition` | `ai` |

### 3.2 `agri-irrigation`

| id | 触发 | 动作 | 默认 mode |
|----|------|------|-----------|
| `irr-manual-zone` | 用户 `zoneOn` + `durationSec` | 开阀+泵 | `manual` |
| `irr-soil-low` | `soil_pct` < 下限 | `zoneOn` 直到回中或 `maxOnSec` | `policy` |
| `irr-rain-skip` | `rain=1` | 拒绝本轮灌溉 | `policy` |
| `irr-schedule` | `windowCron` | 按分区轮灌 | `policy` |
| `irr-ai-et` | AI 蒸散建议 | 只调 `durationSec` 上限内 | `ai` |

### 3.3 `agri-pond`

| id | 触发 | 动作 | 默认 mode |
|----|------|------|-----------|
| `pond-manual` | 用户增氧/喷水 | 原样 | `manual` |
| `pond-do-aerate` | `do_mgl` < 下限 | `aeratorOn` | `policy` |
| `pond-heat-spray` | `water_temp_c` > 上限 | `sprayOn` | `policy` |
| `pond-level-lock` | `water_level_m` < `minLevelM` | 拒绝喷泵 | `policy`（互锁，不可关到无保护） |
| `pond-ai-overnight` | AI 夜间增氧时段 | 仅 `aeratorOn`/`Off` | `ai` |

冷链 Pack 继续用阈值开 Incident，不强制上执行器场景；若站点加了 `kit-rly-4ch` 除霜，用同一 Kernel 的 `policy` 配方，而不是冷链领域里写死继电器。

## 4. 与命令、AI、边缘的关系

- **唯一下行**：`POST /api/v1/commands`（已有）。Scene 评估通过后构造同一 Command 对象（`source=user|policy|ai`）。
- **外部事件**：VistaCast `alert.v1` 经签名 Inbox 映射为 `source=policy` 的 `external_event` 触发。视频不得绕过 Kit 互锁；`care` 不走 MQTT、不自动执行。见 [integrations/vistacast.md](./integrations/vistacast.md)。
- **边缘**：断网时 `policy` 场景由 EdgeAgent 本地评估；上线补传遥测 `quality=backfill`，命令回执走 Outbox。
- **AI**：工具面只允许 Pack/Kit 声明的 `commandId`；禁止任意 RPC、拼 MQTT、关互锁。见 [ai-autonomy.md](./ai-autonomy.md)。
- **幂等**：同一 `idempotencyKey` 不重复开阀；手动与策略冲突时 **互锁优先于开**（fail closed）。

## 5. 演示与验收

| 演示 | 入口 | 必须看到 |
|------|------|----------|
| 窗控 | `POST /demos/smart-window` | 手动开窗；雨量=1 自动关；AI 无证据被拒 |
| 灌溉 | `POST /demos/agri-irrigation` | 土壤低开阀；雨天 skip；干转停泵 |
| 鱼塘 | `POST /demos/agri-pond` | 溶氧低增氧；水位低拒绝喷水 |
| VistaCast | Console **边缘**演示按钮，或 `POST /demos/vistacast-bridge` | 签名 drill 打开 Incident；自动动作默认关；看护无 MQTT。点击路径见 [playbooks/vistacast-bridge.md](../playbooks/vistacast-bridge.md) |

边缘单测：`pnpm --dir iot-edge-agent test`。仿真：`node iot-edge-agent/sim/esp32-kit-sim.mjs`。云编排已在 Gateway 落地（`/controller-kits`、`/scenes/:id/evaluate`、一键演示仿真后跑 Pack 策略场景）。台架顺序：[playbooks/controller-bench.md](../playbooks/controller-bench.md)。
