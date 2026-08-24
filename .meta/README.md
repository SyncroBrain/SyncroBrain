# SyncroBrain Meta-Repo 配置目录

本目录是 **Meta-Repo 的单一配置源（SSOT）**，描述各子仓库的克隆地址、路径与编排顺序。

## 文件

| 文件 | 用途 |
| :--- | :--- |
| `manifest.json` | 子仓库列表、远程 URL、安装顺序、是否必选 |
| `config.json` | 组织名、默认分支、Meta 仓远程 |

## 常用命令

```bash
./dev.sh              # 一键：clone + install + docker（推荐首次）
./dev-mvp.sh          # 启动 gateway + console
./init.sh             # 仅 clone 子仓

# 或
pnpm dev:up
pnpm --dir iot-gateway dev
pnpm --dir iot-console-web dev
# 同时起 gateway + console：
pnpm dev:mvp
# 等价：pnpm run dev:iot-gateway / dev:iot-console-web
```

**不使用** git submodule / git subtree。子目录各自独立 `.git`，在对应目录内提交与 push。

详见 [plan/repository-split.md](../plan/repository-split.md)。
