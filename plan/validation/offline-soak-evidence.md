# Offline soak evidence（模板）

> 活栈演练：Gateway 在 ThingsBoard 不可达期间保持 `/api/v1/health` 可用。  
> 脚本：`deploy/scripts/offline-soak.sh`（默认 `SOAK_SECONDS=3600`）。  
> 设 `WRITE_EVIDENCE=1` 时覆盖同目录 `offline-soak-last.md`；完整 run 日志默认在 `/tmp/syncrobrain-offline-soak-*`。

| 字段 | 值 |
|------|-----|
| 日期 | _YYYY-MM-DD_ |
| 执行人 | |
| 环境 | Cloud Lite compose / 其它：___ |
| SOAK_SECONDS | 3600（或自检短窗：___） |
| 结果 | pass / fail / 未跑 |
| Gateway 健康（soak 中） | |
| TB 恢复后健康 | |
| run 目录 | `/tmp/syncrobrain-offline-soak-…` 或 ___ |

## 命令

```bash
cd deploy
# 自检（短窗）
SOAK_SECONDS=30 ./scripts/offline-soak.sh
# 规格目标 ≥1h + 可提交 last 证据
WRITE_EVIDENCE=1 SOAK_SECONDS=3600 ./scripts/offline-soak.sh
```

## 诚实边界

- **不** 等于 hardware-verified 或 Multi-Vertical 完成。
- **不** 替代 EdgeAgent 环形缓存 / backfill 实机证。
