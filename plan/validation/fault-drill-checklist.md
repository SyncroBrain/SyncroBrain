# Fault-drill checklist（软件侧）

> A7 证据模板。跑 `deploy/scripts/fault-drill.sh` 与可选活栈手工项后，勾选并填日期/备注。  
> L1 脚本路径默认**不**跑 1h 断网/实机实验室；活栈行默认未勾，需人工或 `FAULT_DRILL_LIVE=1` 补证。  
> 目标与演练项对照：[spec/slo.md](../../spec/slo.md) · 冷藏责任边界：[spec/reliability.md](../../spec/reliability.md)

| 字段 | 值 |
|------|-----|
| 日期 | _YYYY-MM-DD_ |
| 执行人 | |
| 环境 | 本机无栈 / Cloud Lite compose / 其它：___ |
| 脚本退出码 | |

## 1. 脚本今日覆盖（L1 / 确定性）

`deploy/scripts/fault-drill.sh` **只**跑下列无活栈依赖片段（除非设 `FAULT_DRILL_LIVE=1`）：

| 勾选 | 步骤 | 命令 / 说明 |
|------|------|-------------|
| [ ] | Edge 协议仿真（含 outbox consume、kill switch） | `node --test iot-edge-agent/test/protocols.test.mjs` |
| [ ] | Gateway unit | `pnpm --ignore-workspace --dir iot-gateway test:unit`（脚本内） |
| [ ] | Gateway API（Fake TB） | `pnpm --ignore-workspace --dir iot-gateway test:api`（脚本内；含 cold-lab 四场景） |
| [ ] | Backup/restore drycheck | `./deploy/scripts/backup-restore-drycheck.sh`（脚本内；无 Docker） |

**Fake TB 四场景（cold-lab）**：`overtemp`（温度）→ `door`（门磁）→ `powerLoss`（断电）→ `offline`（网关离线）。每条路径：simulate 开单 →（可选 webhook 记录）→ ack → clear。规格：`iot-gateway/test/api/fault-drill-scenarios.spec.ts`。

一键：

```bash
./deploy/scripts/fault-drill.sh
```

通过仅表示软件侧 L1 故障相关烟测绿，**不等于** 生产可运营。

## 2. 活栈手工项（模板 — 默认未证明）

需已起 Cloud Lite（或等价）栈。记录观测，勿把 skip / 未跑写成 pass。

| 勾选 | 项 | 建议探测 | 观测 / 证据路径 |
|------|----|----------|-----------------|
| [ ] | Gateway health | `./deploy/scripts/health-check.sh` 或 `curl -s http://127.0.0.1:13200/api/v1/health` | |
| [ ] | Webhook probe | 配 `ALARM_WEBHOOK_URL`；create/ack/clear 后看投递结果（Console 设置 → Webhook 或 Gateway 日志） | |
| [ ] | Duty gap | 无值班/空窗时段开单或升级路径；确认未误标「受保护」 | |
| [ ] | Command timeout | Outbox 命令超时 / Pack TTL 回执路径；超时后状态可审计 | |
| [x] | Offline soak（断网 / TB 不可达） | `SOAK_SECONDS=3600 WRITE_EVIDENCE=1 ./deploy/scripts/offline-soak.sh`（自检可 `SOAK_SECONDS=30`）；见 [offline-soak-evidence.md](./offline-soak-evidence.md) · last：[offline-soak-last.md](./offline-soak-last.md) | **2026-09-20** pass；3600s；pollOk=121 |
| [x] | Backup/restore live（非破坏性） | `WRITE_EVIDENCE=1 ./deploy/scripts/backup-restore-live.sh`（`pg_restore --list` + 临时库）；last：[backup-restore-live-last.md](./backup-restore-live-last.md) | **2026-09-20** pass；非破坏性 |

可选一键活栈（**默认关闭**，L1 保持 no-live）：

```bash
FAULT_DRILL_LIVE=1 SOAK_SECONDS=30 WRITE_EVIDENCE=1 ./deploy/scripts/fault-drill.sh
```

可选对照 [slo.md 演练清单](../../spec/slo.md)（断网 backfill、幂等、时钟漂移、`AI_MODE=off`、TB/边缘重启）——仍属活栈/nightly；offline soak / backup-restore-live 仅在显式调用或 `FAULT_DRILL_LIVE=1` 时进入脚本。

## 3. 明确不宣称

勾选本清单或脚本绿 **不能** 证明：

- **hardware-verified**（实机实验室 / 兼容矩阵品牌列）
- **Multi-Vertical 生产完成**（多垂直运营出门）
- 合同级冷藏 SLO / 通知到达率（见 reliability.md）

发布门总览：[spec/release-gates.md](../../spec/release-gates.md)。运维入口：[deploy/OPS.md](../../../deploy/OPS.md)。

## 4. 相关门备注

- Isolated E2E（`pnpm e2e:isolated`）绿跑现证：**2026-09-20** Playwright **32 passed / 0 skipped / 0 failed**（见 [release-gates.md](../../spec/release-gates.md)）；同日活栈 `E2E_REQUIRE_STACK=1` 亦 32 passed。不得据此宣称多垂直完成或 hardware-verified。
- 活栈 Playwright（`pnpm e2e`）无栈 skip **不是** 出门绿。
