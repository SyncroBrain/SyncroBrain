<p align="center">
  <img src="assets/logo.png" alt="SyncroBrain" width="128" />
</p>

<h1 align="center">SyncroBrain · 万物智脑</h1>

基于 **ThingsBoard CE** 的可交付 IoT 解决方案平台：30 分钟起演示，7 天内完成私有化项目底座。

> **品牌**：[syncrobrain.com](https://syncrobrain.com) · **组织**：[github.com/syncrobrain](https://github.com/syncrobrain)（原 LuminaryIoTChain）  
> **当前阶段**：**Product Iterate** — [plan/product-iterate.md](./plan/product-iterate.md)（先打磨产品；**不挂**公开 docs 站）  
> **ColdGuard** 是参考 Industry Pack，不是唯一可售产品。

## 解决什么问题

| 痛点 | 方案 |
|------|------|
| 项目从零接设备、规则、看板 | Cloud Lite：TB CE + Pack 模板 + Compose |
| 私有化与升级难复制 | 标准安装、备份、版本清单 |
| 不想被闭源云锁死 | 标准 MQTT / REST；TB 可迁出 |
| 行业方案散落在客户分支 | 版本化 Industry Pack |

不承诺：消费级百万设备、AI/链上市场、默认 EMQX 全家桶。详见 [`spec/platform-vision.md`](./spec/platform-vision.md)。

## 架构（Cloud Lite）

| 层 | 默认 | 说明 |
|----|------|------|
| 入口 | iot-console-web | 项目、Pack、部署状态 |
| 编排 | iot-gateway（NestJS Fastify） | Pack、许可、TB REST、身份 |
| 运行时 | **ThingsBoard CE** | MQTT、设备、遥测、规则、告警、看板 |
| 数据 | PostgreSQL | TB 默认存储 |
| 可选（非 Cloud Lite） | EMQX / DataTalk | 合同或 SLO 触发 |

权威：[`spec/architecture.md`](./spec/architecture.md)。

## 仓库结构（MetaRepo + 多仓）

```text
syncrobrain/platform/              # MetaRepo（私有）
├── .meta/                       # manifest.json
├── syncrobrain.code-workspace
├── spec/ plan/ contracts/ playbooks/
├── init.ps1 / init.sh / dev.ps1
├── iot-gateway/
├── iot-console-web/
├── website/
├── docs/
└── deploy/
```

```powershell
git clone git@github.com:syncrobrain/platform.git syncrobrain
cd syncrobrain
.\dev.ps1
```

| 可见性 | 仓库 |
|--------|------|
| **Private（默认）** | platform、iot-gateway、iot-console-web、website、deploy |
| **docs** | 可本地草稿；**暂不挂公开站点**，不作为产品发布面 |

不用 git submodule / subtree。[ONBOARDING.md](./ONBOARDING.md) · [plan/repository-split.md](./plan/repository-split.md)。

## 快速开始

首次（clone 子仓、env、Docker、install、migrate）：

```powershell
git clone git@github.com:syncrobrain/platform.git syncrobrain
cd syncrobrain
.\dev.ps1
```

Linux / macOS：`./dev.sh`。等价：`pnpm dev:up`。

日常在 **MetaRepo 根目录** 用 `pnpm --dir <子目录>` 启服务（不必先 `cd`）：

```bash
pnpm --dir iot-gateway dev       # :13200
pnpm --dir iot-console-web dev   # :15180
pnpm --dir website dev           # :13013
pnpm --dir docs dev              # :13014
```

| 命令 | 作用 |
|------|------|
| `pnpm dev:up` | 一键 bootstrap（同 `./dev.sh`） |
| `pnpm --dir iot-gateway dev` | Gateway，`http://localhost:13200` |
| `pnpm --dir iot-console-web dev` | Console，`http://localhost:15180` |
| `pnpm --dir website dev` | 官网，`http://localhost:13013` |
| `pnpm --dir docs dev` | 文档草稿，`http://localhost:13014` |
| `pnpm dev:mvp` | 同时起 gateway + console |

`package.json` 里 `dev:iot-gateway` 等与上表 `--dir` 命令等价。Windows 也可 `.\dev-mvp.ps1` 开两个独立窗口。

改宿主机代码前，先停 compose 里的应用容器：`docker compose -f deploy/docker-compose.dev.yml stop iot-gateway iot-console`。

Logto 为可选统一登录（Audience `https://api.iotchain.local`）。Casbin `iot.*` 在 gateway。Build 可用演示登录。详情：[ONBOARDING.md](./ONBOARDING.md)。

## LuminaryWorks 生态

Cloud Lite **独立可售**。下表可选。

| 项目 | 关系 |
|------|------|
| [LuminaryWorks](https://luminaryworks.dev) | 可选共享身份 |
| [DataLuminary](https://dataluminary.dev) | 可选大屏；默认 TB Dashboard |
| [BlockyEdu](https://blockyedu.com) | 可选培训 |
| [DoerFlow](https://doerflow.dev) | 不进入当前阶段 |
| [VistaRemote](https://remote.vistacast.dev) | 可选 |
| [VistaCast](https://vistacast.dev) | 首年不做 |

## 文档

| 文档 | 说明 |
|------|------|
| [spec/index.md](./spec/index.md) | 索引 |
| [spec/platform-vision.md](./spec/platform-vision.md) | 愿景 |
| [spec/architecture.md](./spec/architecture.md) | TB Cloud Lite |
| [plan/product-iterate.md](./plan/product-iterate.md) | **当前**：产品打磨 |
| [plan/showcase.md](./plan/showcase.md) | Showcase（已关闭，内部演示） |
| [plan/build.md](./plan/build.md) | Build 8 周（已冻结） |
| [spec/coldguard.md](./spec/coldguard.md) | 参考 Pack |
| [spec/licensing.md](./spec/licensing.md) | NC + TB Apache-2.0 |
| [syncrobrain/docs](https://github.com/syncrobrain/docs) | 文档草稿仓（**暂不挂站**） |

## License

[Polyform Noncommercial License 1.0.0](LICENSE) applies to SyncroBrain original code. ThingsBoard CE is Apache-2.0 (upstream). Narrative: [`spec/licensing.md`](./spec/licensing.md).
