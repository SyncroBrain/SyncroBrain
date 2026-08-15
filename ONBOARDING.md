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

Linux / macOS：`chmod +x dev.sh dev-mvp.sh && ./dev.sh && ./dev-mvp.sh`

| 脚本 | 作用 |
|------|------|
| `init.sh` / `init.ps1` | 仅 clone 子仓 |
| **`dev.sh` / `dev.ps1`** | clone + env + docker + install + migrate |
| `dev-mvp.ps1` | 启动 gateway (:13100) + console (:5180) |

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

### 2. 基础设施

```powershell
cd D:\www\syncrobrain\deploy
docker compose -f docker-compose.dev.yml up -d
```

### 3. iot-gateway

```powershell
cd D:\www\syncrobrain\services\iot-gateway
copy .npmrc.example .npmrc
copy .env.example .env
pnpm install --no-frozen-lockfile && pnpm dev
# http://localhost:13100
```

### 4. iot-console-web

```powershell
cd D:\www\syncrobrain\services\iot-console-web
copy .env.development.example .env.development
pnpm install && pnpm dev
# http://localhost:5180
```

Logto Redirect：`http://localhost:5180/auth/callback`

## 按角色单独开发

| 场景 | 做法 |
|------|------|
| 改规格 / 里程碑 | 在 MetaRepo 根目录提交 `spec/` `plan/` |
| 只改后端 | `cd iot-gateway` → commit → push 到 `syncrobrain/iot-gateway` |
| 只改控制台 | `cd iot-console-web` → push 到 `iot-console-web` |
| 只改官网 | `cd website` → push 到 `website` |
| 写对外文档 | `cd docs` → push 到 `docs`（公开） |

**提交原则**：业务代码在子目录内 commit / push，MetaRepo 只提交 spec、plan、contracts、tooling。

## 数据存储与登录

- OLTP：PostgreSQL `:5434` — [datastore](https://github.com/LuminaryWorks/docs/blob/main/docs/develop/datastore.md)
- 统一登录：`@luminaryworks/auth-core` — [identity-roadmap](https://github.com/LuminaryWorks/docs/blob/main/docs/develop/identity-roadmap.md)
