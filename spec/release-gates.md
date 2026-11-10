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
| AI 安全 | injection、越权、任意 RPC/SQL、超范围、重复幂等、kill switch、ActionPolicy | 不能开 Autopilot |
| 故障演练 | `deploy/scripts/fault-drill.sh`；活栈见 [slo.md](./slo.md)；勾选模板 [fault-drill-checklist.md](../plan/validation/fault-drill-checklist.md) | 不能宣称生产可运营 |
| 硬件 | 实机实验室；勾选模板 [hardware-lab-checklist.md](../plan/validation/hardware-lab-checklist.md) | 否则品牌列保持 `—` / 未实机 |

真实模型评测 **不** 代替确定性门。

## 当前实现状态（2026-11-10）

| 门 | 状态 |
|----|------|
| L1 | 本机 `pnpm test:l1` 通过：gateway unit **314**、Fake TB API **85**、console unit **71**、edge kits/protocols **15**、contracts ok。废除 2026-08「14 passed」旧证。 |
| Isolated E2E | 2026-11-10 `pnpm e2e:isolated` 退出码 0：Playwright **32 passed / 0 skipped / 0 failed**。不得据此宣称多垂直完成或 hardware-verified。 |
| 领域内核 | RPC→Safety；Outbox↔Edge receipt（Rejected→failed）；活遥测→scene/policy；AI stub + ActionPolicy 升自治 |
| Pack | 通道补齐 + 安装校验 + 上一版 rollback；golden alarm+ack |
| Console | OEM footer；告警/总览/DemoCoach Pack 驱动 |
| Entitlement | 本地↔中央 feature-map；`pnpm ent:sidecar` DX（不进默认 compose） |
| 硬件 | 未实机；不得宣称全硬件生产兼容 |

MetaRepo GitHub CI 只跑合同 + Edge（子仓 gitignore）。L1 / isolated e2e 在 `iot-gateway` / `iot-console-web` CI 与本地 `pnpm test:l1`、`pnpm e2e:isolated` 出门。
