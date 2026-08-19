<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/syncrobrain/.github/main/profile/banner.png">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/syncrobrain/.github/main/profile/banner.png">
  <img alt="SyncroBrain — Cloud Lite on ThingsBoard CE" src="https://raw.githubusercontent.com/syncrobrain/.github/main/profile/banner.png" width="100%">
</picture>

<h1 align="center">SyncroBrain · 万物智脑</h1>

<p align="center">
  <strong>Cloud Lite</strong> — ship a private IoT stack in days: ThingsBoard CE runtime, industry packs, on-prem install.<br/>
  30 分钟起演示 · 7 天项目底座 · 标准 MQTT/REST
</p>

<p align="center">
  <a href="https://syncrobrain.com"><img alt="Website" src="https://img.shields.io/badge/website-syncrobrain.com-2563eb?style=for-the-badge&logo=googlechrome&logoColor=white"></a>
  <a href="https://github.com/syncrobrain/docs"><img alt="Docs" src="https://img.shields.io/badge/docs-public-06b6d4?style=for-the-badge&logo=readthedocs&logoColor=white"></a>
  <a href="https://github.com/syncrobrain/platform"><img alt="Platform" src="https://img.shields.io/badge/meta--repo-platform-10b981?style=for-the-badge&logo=github&logoColor=white"></a>
</p>

---

## What we build

**SyncroBrain** is a delivery layer on **ThingsBoard CE**: project install, industry packs (device profile, rule chain, dashboard), license, and a product console.

**ColdGuard** (`cold-lab`) is the first *reference pack* (lab cold storage alerts), not the only SKU.

| Layer | Default (Cloud Lite) | Role |
|------:|----------------------|------|
| **Console** | iot-console-web | Project, pack, deploy status |
| **Orchestration** | NestJS gateway | Pack apply, entitlement, TB REST, identity |
| **Runtime** | ThingsBoard CE | MQTT, devices, telemetry, rules, alarms |
| **Data** | PostgreSQL | TB default store |

EMQX / DataTalk are optional after a contract or SLO. Native apps are not year-one.

**We do not:** million-device consumer IoT, rebuilding MQTT from scratch, or claiming TB is our Apache kernel.

## Repositories

| Repo | Visibility | Description |
|------|------------|-------------|
| [platform](https://github.com/syncrobrain/platform) | Private | Meta-repo — spec, plan, contracts |
| [docs](https://github.com/syncrobrain/docs) | Public | RsPress documentation |
| [iot-gateway](https://github.com/syncrobrain/iot-gateway) | Private | Fastify orchestration |
| [iot-console-web](https://github.com/syncrobrain/iot-console-web) | Private | Product console |
| [website](https://github.com/syncrobrain/website) | Private | [syncrobrain.com](https://syncrobrain.com) |
| [deploy](https://github.com/syncrobrain/deploy) | Private | Compose (TB CE + PG + apps) |

## LuminaryWorks ecosystem

Cloud Lite is sellable on its own. Sibling products are optional.

## Quick links

- [syncrobrain.com](https://syncrobrain.com)
- [Documentation](https://github.com/syncrobrain/docs)
- [Getting started](https://github.com/syncrobrain/platform/blob/main/ONBOARDING.md)
- [1@zhoulujun.cn](mailto:1@zhoulujun.cn)

<p align="center">
  <sub>Ship a private IoT stack in days.</sub>
</p>
