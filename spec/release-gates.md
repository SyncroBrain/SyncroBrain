# 发布门 (v1.0)

> 未过门不得对运营宣称「多垂直生产完成」。硬件型号另见 [compatibility-matrix.md](./compatibility-matrix.md)。

## L1（出门必跑）

```bash
pnpm test:l1
pnpm lint:apps
```

包含：Gateway unit + Fake TB API、Console unit、EdgeAgent 协议仿真、OpenAPI/JSON Schema。

## Isolated E2E

```bash
pnpm e2e:isolated
```

cold-lab / env-lab 黄金路径必须绿。新 Pack 用 Fake TB API `POST /demos/{slug}` + Console `/` `/assets` `/alarms`。

## Nightly / release

| 门 | 内容 | 失败含义 |
|----|------|----------|
| 协议仿真 | `pnpm --dir iot-edge-agent test` + `sim/*-sim.mjs` | 不能标 protocol-verified |
| AI 安全 | injection、越权、任意 RPC/SQL、超范围、重复幂等、kill switch | 不能开 Autopilot |
| 故障演练 | `deploy/scripts/fault-drill.sh`；活栈见 [slo.md](./slo.md) | 不能宣称生产可运营 |
| 硬件 | 实机实验室 | 否则品牌列保持 `—` |

真实模型评测 **不** 代替确定性门。

## 当前实现状态（2026-08-31）

| 门 | 状态 |
|----|------|
| L1 | Gateway/Console/Edge/合同 可本地 `pnpm test:l1` |
| Isolated E2E | **14 passed**，`pnpm e2e:isolated` 退出码 0（cold-lab / env-lab + production-packs） |
| 领域内核 | Alarm → Incident；值班/校准/合规 CSV；Outbox → Edge 回执（Fake TB 内联） |
| AI 包 | `@luminaryworks/ai-client` / `@luminaryworks/ai-react` ModelForm；测试桩 fail-closed |
| 硬件 | 未实机；不得宣称全硬件生产兼容 |

MetaRepo GitHub CI 只跑合同 + Edge（子仓 gitignore）。L1 / isolated e2e 在 `iot-gateway` / `iot-console-web` CI 与本地 `pnpm test:l1`、`pnpm e2e:isolated` 出门。
