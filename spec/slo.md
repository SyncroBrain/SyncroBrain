# SLO 与故障演练 (v0.1)

| 指标 | 目标 | 测量 |
|------|------|------|
| 遥测接收 | Cloud Lite 演示点位 p95 < 2s 入库 | Fake TB + mqtt-sim |
| 告警生成 | 仿真越阈后 Console 可见 < 5s（即时开单路径） | Playwright isolated |
| 命令送达 | Outbox 写入后标记 dispatched；回执超时按 Pack TTL | Gateway API |
| AI 拒绝率 | 越权/越界/injection 必须 100% deny | safety-kernel + domain API |
| AI 成本 | 记录 prompt/completion tokens | `ai_usage_events` |

## 演练清单

- 断网：EdgeAgent 环形缓存，上线 `quality=backfill`
- 重复消息：命令 `idempotencyKey`
- 乱序 / 时钟漂移：遥测信封 quality
- Provider 不可用：`AI_MODE=off` 监控仍可用
- TB 重启：Gateway `TB_MODE` / health
- 边缘重启：`POST /edge/nodes` lastSeen
- kill switch：远程控制 fail closed

活栈演练不是 L1 出门门；记录放 `plan/validation/evidence/`。
