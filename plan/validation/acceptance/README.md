# Cloud Lite AI 验收（证据包）

确定性测试（Vitest / Playwright）**不是**「AI 验收」。AI 验收 = 用 **Grok 4.6 High** 读取本目录的 rubric + 一次 `pnpm acceptance:evidence` 产出的 `last-run/` 证据，按 [schema.json](./schema.json) 输出 `verdict`。

## 生成证据（不需要模型 API key）

```bash
# 单元 + lint/build 记录 + 一次 Playwright（无栈则 skip）
pnpm acceptance:evidence
# 同义
pnpm acceptance:prepare
```

产物：

| 文件 | 说明 |
|------|------|
| [rubric.json](./rubric.json) | 机器可读评分项 |
| [schema.json](./schema.json) | 审阅输出 JSON Schema |
| [reviewer-prompt.md](./reviewer-prompt.md) | 给后续 Grok 4.6 High agent 的固定提示 |
| `last-run/evidence.json` | 本次命令收集的结构化结果（gitignored） |
| `last-run/evidence.md` | 给人读的摘要 |

`last-run/` 是生成物，不要提交。没有 API key **不得**当作 unit / 无栈 E2E 的失败理由。

## 一键命令（MetaRepo 根）

| 命令 | 作用 |
|------|------|
| `pnpm test` | gateway + console 单元测试 |
| `pnpm verify` | unit + lint + build（不含活栈 E2E） |
| `pnpm e2e` | Playwright；栈未起 skip |
| `E2E_REQUIRE_STACK=1 pnpm e2e` | 栈未起则失败 |
| `pnpm acceptance:evidence` | 跑可跑的检查并写 `last-run/` |

子仓：`pnpm --dir iot-gateway test` · `pnpm --dir iot-console-web test` · `pnpm --dir iot-console-web e2e`

## 活栈

需要 Console `:15180`、Gateway `:13200`、ThingsBoard `health.thingsboard=up`。TB+PG 已在、应用未起时：

```bash
pnpm --dir iot-gateway dev
pnpm --dir iot-console-web dev
E2E_REQUIRE_STACK=1 pnpm --dir iot-console-web e2e
```

或 `cd deploy && docker compose -f docker-compose.dev.yml up -d --build`。

## 后续 Grok 审阅

另开 **Grok 4.6 High** agent，把 [reviewer-prompt.md](./reviewer-prompt.md) + `last-run/evidence.json` 交给它，要求只输出符合 schema 的 JSON（可附简短 Markdown）。本目录不调用外部模型 API。
