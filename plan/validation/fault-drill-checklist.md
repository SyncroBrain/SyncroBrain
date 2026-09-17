# Fault-drill checklist（软件侧）

> A7 证据模板。跑 `deploy/scripts/fault-drill.sh` 与可选活栈手工项后，勾选并填日期/备注。  
> **不** 扩成 1h 断网/实机实验室；活栈行默认未勾，需人工补证。  
> 目标与演练项对照：[spec/slo.md](../../spec/slo.md) · 冷藏责任边界：[spec/reliability.md](../../spec/reliability.md)

| 字段 | 值 |
|------|-----|
| 日期 | _YYYY-MM-DD_ |
| 执行人 | |
| 环境 | 本机无栈 / Cloud Lite compose / 其它：___ |
| 脚本退出码 | |

## 1. 脚本今日覆盖（L1 / 确定性）

`deploy/scripts/fault-drill.sh` **只**跑下列无活栈依赖片段：

| 勾选 | 步骤 | 命令 / 说明 |
|------|------|-------------|
| [ ] | Edge 协议仿真（含 outbox consume、kill switch） | `node --test iot-edge-agent/test/protocols.test.mjs` |
| [ ] | Gateway unit | `pnpm --ignore-workspace --dir iot-gateway test:unit`（脚本内） |
| [ ] | Gateway API（Fake TB） | `pnpm --ignore-workspace --dir iot-gateway test:api`（脚本内） |

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

可选对照 [slo.md 演练清单](../../spec/slo.md)（断网 backfill、幂等、时钟漂移、`AI_MODE=off`、TB/边缘重启）——仍属活栈/nightly，**不在** `fault-drill.sh` 内。

## 3. 明确不宣称

勾选本清单或脚本绿 **不能** 证明：

- **hardware-verified**（实机实验室 / 兼容矩阵品牌列）
- **Multi-Vertical 生产完成**（多垂直运营出门）
- 合同级冷藏 SLO / 通知到达率（见 reliability.md）

发布门总览：[spec/release-gates.md](../../spec/release-gates.md)。运维入口：[deploy/OPS.md](../../../deploy/OPS.md)。

## 4. 相关门备注

- Isolated E2E（`pnpm e2e:isolated`）在 release-gates 中的绿跑记录为 **2026-09-10** 历史快照；下次绿跑前勿当作当前 CI/本机最新证据。
- 活栈 Playwright（`pnpm e2e`）无栈 skip **不是** 出门绿。
