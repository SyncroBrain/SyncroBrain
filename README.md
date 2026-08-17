<p align="center">
  <img src="assets/logo.png" alt="SyncroBrain" width="128" />
</p>

<h1 align="center">SyncroBrain · 万物智脑</h1>

实验室与园区冷藏设备的**合规监控与事件闭环**。长期平台名是 SyncroBrain；当前唯一优先交付是 **ColdGuard**。

> **品牌**：[syncrobrain.com](https://syncrobrain.com) · **组织**：[github.com/syncrobrain](https://github.com/syncrobrain)（原 LuminaryIoTChain）  
> **组织主页资料**：[`assets/github/`](./assets/github/)  
> **承诺**：不更换现有冰箱，把多品牌冷藏变成可审计、可告警、可追责的一套系统。

## 解决什么问题

| 痛点 | 方案 |
|------|------|
| 人工抄表、微信群告警、多品牌 App | ColdGuard：温度 / 门磁 / 断电 / 网关离线 + 确认与升级 |
| 审计取证耗天数 | 事件时间线、校准记录、不可变审计日志 |
| 数据必须留在园区 | Cloud Lite 可私有化；默认可关闭遥测回传 |
| 不想被平台锁死 | 标准 MQTT / REST，CSV/API 可迁出 |

不在首年承诺：通用 IoT 能力清单、AI Agent 市场、链上收益、原生 App、ThingsBoard 全家桶。详见 [`spec/coldguard.md`](./spec/coldguard.md) · [`spec/platform-vision.md`](./spec/platform-vision.md)。

## 架构（领域产品在上）

| 层 | 默认（Cloud Lite） | 说明 |
|----|-------------------|------|
| 体验 | ColdGuard Web / PWA | QA 工作台；不暴露 ThingsBoard UI |
| 领域 | NestJS（Fastify） | 站点 / 资产 / 事件 / 校准 / 审计 / 报告 |
| 消息与数据 | EMQX + PostgreSQL/Timescale | 分钟级采样与质量标记 |
| 边缘 | 认证传感器 + 网关 | 本地阈值、断网缓存、校准证书 |
| 适配（按证据） | ThingsBoard / DataTalk | 可选，不是 MVP 默认栈 |

权威：[`spec/architecture.md`](./spec/architecture.md)。

## 仓库结构（MetaRepo + 多仓）

```text
syncrobrain/platform/              # MetaRepo（私有）
├── .meta/                       # manifest.json — 子仓 SSOT
├── syncrobrain.code-workspace   # VS Code / Cursor 多根工作区
├── spec/ plan/ contracts/ playbooks/
├── init.ps1 / init.sh / dev.ps1 # clone + 一键 bootstrap
├── iot-gateway/                 # → 独立仓
├── iot-console-web/             # → 独立仓
├── website/                     # → 独立仓
├── docs/                        # → 独立仓
└── deploy/                      # → 独立仓
```

```powershell
git clone git@github.com:syncrobrain/platform.git syncrobrain
cd syncrobrain
.\dev.ps1
```

| 可见性 | 仓库 |
|--------|------|
| **Public** | `syncrobrain/docs` |
| **Private** | platform、iot-gateway、iot-console-web、website、deploy |

**不用** git submodule / subtree。新人上手：[ONBOARDING.md](./ONBOARDING.md)。拆解：[plan/repository-split.md](./plan/repository-split.md)。

## 快速开始（一键）

```powershell
git clone git@github.com:syncrobrain/platform.git syncrobrain
cd syncrobrain
.\dev.ps1          # clone 子仓 · docker · pnpm install · 迁移
.\dev-mvp.ps1      # 启动 gateway + console
```

Linux / macOS：`./dev.sh && ./dev-mvp.sh`

Logto 统一登录需另启 [LuminaryWorks/identity](https://github.com/LuminaryWorks/identity)（Audience `https://api.iotchain.local`）。资源权限由 gateway **Casbin**（`iot.*`）计算，不写进 JWT。详见 [ONBOARDING.md](./ONBOARDING.md) · [spec/index.md](./spec/index.md) · [IAM 规格](https://github.com/LuminaryWorks/LuminaryWorks/blob/main/spec/identity-and-permissions.md)。

## LuminaryWorks 生态

ColdGuard **独立可售**。下表均为可选，不是上线前置。

| 项目 | 官网 | 关系 |
|------|------|------|
| [LuminaryWorks](https://luminaryworks.dev) | [luminaryworks.dev](https://luminaryworks.dev) | 共享身份 |
| [DataLuminary](https://dataluminary.dev) | [dataluminary.dev](https://dataluminary.dev) | 可选大屏适配 |
| [BlockyEdu](https://blockyedu.com) | [blockyedu.com](https://blockyedu.com) | 可选培训 |
| [DoerFlow](https://doerflow.dev) | [doerflow.dev](https://doerflow.dev) | 不进入 MVP |
| [VistaRemote](https://remote.vistacast.dev) | [remote.vistacast.dev](https://remote.vistacast.dev) | 可选远程桌面 |
| [VistaCast](https://vistacast.dev) | [vistacast.dev](https://vistacast.dev) | 视频 AI；首年不做 |

口径：SyncroBrain + 五家兄弟产品。见 [`spec/ecosystem.md`](./spec/ecosystem.md)。

## 文档

| 文档 | 说明 |
|------|------|
| [spec/index.md](./spec/index.md) | 规格索引 |
| [spec/coldguard.md](./spec/coldguard.md) | 首款产品 |
| [spec/industry-pack.md](./spec/industry-pack.md) | 实验室冷藏 Pack 默认值 |
| [spec/reliability.md](./spec/reliability.md) | SLO、演练、责任边界 |
| [spec/platform-vision.md](./spec/platform-vision.md) | 愿景与红线 |
| [spec/architecture.md](./spec/architecture.md) | Cloud Lite 与适配层 |
| [spec/licensing.md](./spec/licensing.md) | 开源边界与商业许可 |
| [plan/README.md](./plan/README.md) | 阶段门 |
| [plan/validation.md](./plan/validation.md) | 当前 90 天执行手册 |
| [syncrobrain/docs](https://github.com/syncrobrain/docs) | **对外** RsPress 文档站 |

## License

[Polyform Noncommercial License 1.0.0](LICENSE) (Polyform-NC). Non-commercial use permitted. Commercial use requires a separate license from SyncroBrain. Narrative: [`spec/licensing.md`](./spec/licensing.md).
