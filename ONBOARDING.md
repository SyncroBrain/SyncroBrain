# SyncroBrain 新人上手

> 生态通用步骤：[LuminaryWorks/docs — 新人上手](https://github.com/LuminaryWorks/docs/blob/main/docs/develop/onboarding.md)  
> 仓库拆解：[plan/repository-split.md](./plan/repository-split.md)

## MetaRepo vs 子仓

| 模块 | 目录 | 说明 |
|------|------|------|
| 编排 | 本仓 `platform` | `init.sh` 拉子项目；**不用** submodule / subtree |
| 后端 | `iot-gateway/` | NestJS |
| 前端 | `iot-console-web/` | Web 控制台 |
| 官网 | `website/` | Next.js → Cloudflare Pages |
| 文档 | `docs/` | 对外文档（RsPress，公开仓，`pnpm dev` → :13014） |
| 部署 | `deploy/` | Docker Compose |

子仓清单：`.meta/manifest.json`

## 一键开发环境

clone MetaRepo 后**一条命令**完成：拉子仓 → 复制 `.env` → Docker → `pnpm install` → 数据库迁移。

```powershell
git clone git@github.com:syncrobrain/platform.git syncrobrain
cd syncrobrain

# 一键 bootstrap（需 Node、pnpm、Docker）
.\dev.ps1

# 启动 gateway + console（两个独立窗口）
.\dev-mvp.ps1
```

Linux / macOS：`chmod +x dev.sh && ./dev.sh`（现已 `compose up --build` 含 Gateway/Console）。改代码再用 `./dev-mvp.sh` 前请先 `docker compose stop iot-gateway iot-console`。

| 脚本 | 作用 |
|------|------|
| `init.sh` / `init.ps1` | 仅 clone 子仓 |
| **`dev.sh` / `dev.ps1`** | clone + env + docker + install + migrate |
| `dev-mvp.ps1` | 启动 gateway (:13200) + console (:5180) |

可选参数：`.\dev.ps1 -SkipDocker` · `.\dev.ps1 -RequiredOnly`（只拉必选子仓）

**前置**：`iot-gateway` 从 npmjs 安装公开包 `@luminaryworks/auth-core`。无需 GitHub Packages token。

## 初始化（仅 clone）

若只需拉子仓、不装包：

```bash
chmod +x init.sh && ./init.sh
```

Windows：`.\init.ps1 -Only iot-gateway,iot-console-web`

## 用 IDE 查看全部代码

**File → Open Workspace from File → `syncrobrain.code-workspace`**

多根工作区可同时浏览 MetaRepo 与各子仓，各自独立 Git 提交。

## 快速开始（全栈 dev）

### 1. 生态依赖

```powershell
cd D:\www\LuminaryWorks\identity
.\bootstrap.ps1

cd D:\www\LuminaryWorks\shared
pnpm install && pnpm build
```

### 2. 一键全栈（推荐演示 / 关门）

须先停宿主机占用 `:13200` / `:5180` 的 `pnpm dev`。

```bash
cd deploy
docker compose -f docker-compose.dev.yml up -d --build
# PostgreSQL :5438 · ThingsBoard CE :8080 / MQTT :1883
# Gateway :13200 · Console :5180
# 首次启动 TB 需 1–2 分钟。默认 sysadmin@thingsboard.org / sysadmin（立刻改密）
# 运维：deploy/OPS.md · 安全：deploy/SECURITY.md
```

打开 `http://localhost:5180`。Gateway 健康检查：`http://localhost:13200/api/v1/health`

### 3. 改代码时用宿主机进程

停应用容器后：`docker compose -f docker-compose.dev.yml stop iot-gateway iot-console`

```bash
cd iot-gateway
cp .env.example .env
pnpm install --no-frozen-lockfile && pnpm migration:run && pnpm dev
# http://localhost:13200/api/v1/health
```

```bash
cd iot-console-web
cp .env.development.example .env.development
pnpm install && pnpm dev
# http://localhost:5180
```

Logto Redirect：`http://localhost:5180/auth/callback`

## 按角色单独开发

| 场景 | 做法 |
|------|------|
| 改规格 / 阶段门 | 在 MetaRepo 提交 `spec/` `plan/`；当前阶段 **Build**，见 [plan/build.md](./plan/build.md) |
| 只改后端 | `cd iot-gateway` → commit → push 到 `syncrobrain/iot-gateway` |
| 只改控制台 | `cd iot-console-web` → push 到 `iot-console-web` |
| 只改官网 | `cd website` → push 到 `website` |
| 写对外文档 | `cd docs` → push 到 `docs`（公开） |

**提交原则**：业务代码在子目录内 commit / push，MetaRepo 只提交 spec、plan、contracts、tooling。

## 数据存储与登录

- OLTP：PostgreSQL `:5438`（Gateway `iot_core`）；ThingsBoard 用镜像内嵌 PG（volume `syncrobrain_tb_data`）
- 统一登录：未设 `IDP_ISSUER` 时演示 JWT；`CASBIN_DEV_OPEN=true` 为本地开放策略
- 运行时：ThingsBoard CE `http://127.0.0.1:8080`
