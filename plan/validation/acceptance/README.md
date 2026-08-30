# Cloud Lite 验收（确定性门 + 可选审阅）

产品**没有** LLM 功能；规划也禁止把模型做成运行时。下面三层都是确定性的。所谓「AI 验收」只是可选地把证据交给人/agent 读，**默认关、不进 CI、不能当出门门**。

## 层级

| 层 | 命令 | 依赖 | CI |
|----|------|------|-----|
| **L1** | `pnpm test` / `pnpm test:l1` | 无 Docker、无 TB | 子仓 + Meta 本地 |
| **L2** | 含在 L1 的 `pnpm --dir iot-gateway test:api` | Fake TB + sqlite | Gateway CI，**禁止 skip** |
| **L3 isolated** | `pnpm e2e:isolated` | Fake TB + sqlite + Console | Meta 工作区；禁止 skip |
| **L3 live** | `E2E_REQUIRE_STACK=1 pnpm e2e` | 真 TB CE | 可选；无栈不得记 pass |
| 可选审阅 | `pnpm acceptance:evidence` 后人工/agent 读 `last-run/` | 无模型 API | **不是门** |

## L1（Agent 从根目录只跑这一条）

```bash
pnpm test:l1
```

跑：gateway unit、gateway Fake TB API、console unit、`contracts/*.yaml` 烟测。

## 安全码（替代口头改密红线的应用层断言）

`GET /api/v1/health` 的 `security.codes`：

- `CASBIN_DEV_OPEN`
- `JWT_SECRET_WEAK`
- `TB_PASSWORD_DEFAULT`
- `DB_PASSWORD_DEFAULT`

L2 API 与 Playwright `e2e/security-codes.spec.ts` 断言这四项。改密 / backup 演练仍是运维，不自动化。

## 活栈 Playwright

需要 Console `:15180`、Gateway `:13200`、ThingsBoard `health.thingsboard=up`。无栈时 `pnpm e2e` **skip**；skip ≠ 通过。

```bash
E2E_REQUIRE_STACK=1 pnpm --dir iot-console-web e2e
```

一键演示会 `DELETE /projects/:id` 清理（`helpers.trackProject`）。

## 可选证据包（不需要模型 API key）

```bash
pnpm acceptance:evidence
```

产物给后续审阅用。没有 API key **不得**当作 L1 失败。把 skip 的活栈 E2E 写成 pass 是错误。

## 禁止

- 产品 Gateway / Console 调用 LLM
- 用模型点 Ant Design
- 把 AI verdict 做成 GitHub 必过检查
- 把无栈 Playwright skip 当成绿
