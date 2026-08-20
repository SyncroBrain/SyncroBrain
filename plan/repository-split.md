# SyncroBrain 仓库拆解计划

> **目标**：MetaRepo 多仓布局 — 业务子仓与 MetaRepo **私有**；docs 仓可存在，但 **当前不挂公开站点**。  
> **状态**：子仓已独立；当前阶段 [product-iterate.md](./product-iterate.md)

## 独立仓库

| 仓库 | 本地路径 | 可见性 |
|------|----------|--------|
| `platform` | `.`（MetaRepo） | Private |
| `iot-gateway` | `iot-gateway/` | Private |
| `iot-console-web` | `iot-console-web/` | Private |
| `website` | `website/` | Private |
| `docs` | `docs/` | 仓可 Public；**站点暂不部署** |
| `deploy` | `deploy/` | Private |

清单 SSOT：[`.meta/manifest.json`](../.meta/manifest.json)

## 原则

- **不使用** git submodule、git subtree
- 子仓各自独立 Git；`./init.sh` 平级 clone
- IDE 用 **`syncrobrain.code-workspace`** 多根查看

## 新人流程

```bash
git clone git@github.com:syncrobrain/platform.git syncrobrain
cd syncrobrain
./dev.sh
./dev-mvp.sh
```

## MetaRepo 目录

```text
syncrobrain/platform/
├── .meta/
├── syncrobrain.code-workspace
├── spec/ plan/ contracts/ playbooks/
├── init.sh  dev.sh
├── iot-gateway/          # init clone
├── iot-console-web/
├── website/
├── docs/
└── deploy/
```

## 单独开发某一子仓

```bash
git clone git@github.com:syncrobrain/iot-gateway.git
cd iot-gateway
pnpm install && pnpm dev
```

## 验收

- [x] 5 个子仓已在 GitHub 独立存在
- [x] 路径扁平化（无 `services/` 前缀）
- [x] MetaRepo 不含业务源码提交
- [x] `./dev.sh` 一键 clone + install + docker
