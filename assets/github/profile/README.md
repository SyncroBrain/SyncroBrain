<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/syncrobrain/.github/main/profile/banner.png">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/syncrobrain/.github/main/profile/banner.png">
  <img alt="SyncroBrain — ColdGuard · 实验室冷藏合规" src="https://raw.githubusercontent.com/syncrobrain/.github/main/profile/banner.png" width="100%">
</picture>

<h1 align="center">SyncroBrain · 万物智脑</h1>

<p align="center">
  <strong>ColdGuard</strong> — auditable cold-storage monitoring and incident close-loop for regulated labs.<br/>
  不更换现有冰箱 · 可告警、可确认、可追责 · 可私有化
</p>

<p align="center">
  <a href="https://syncrobrain.com"><img alt="Website" src="https://img.shields.io/badge/website-syncrobrain.com-2563eb?style=for-the-badge&logo=googlechrome&logoColor=white"></a>
  <a href="https://github.com/syncrobrain/docs"><img alt="Docs" src="https://img.shields.io/badge/docs-public-06b6d4?style=for-the-badge&logo=readthedocs&logoColor=white"></a>
  <a href="https://github.com/syncrobrain/platform"><img alt="Platform" src="https://img.shields.io/badge/meta--repo-platform-10b981?style=for-the-badge&logo=github&logoColor=white"></a>
</p>

---

## What we build

**ColdGuard** is the first product: multi-brand laboratory fridges, freezers, and cold rooms — temperature, door, power, and gateway offline — with acknowledgement, escalation, calibration records, and exportable audit evidence.

SyncroBrain is the long-term platform name. We do not sell “open-source MQTT + AI + blockchain” as the MVP.

| Layer | Default (Cloud Lite) | Role |
|------:|----------------------|------|
| **Experience** | ColdGuard Web / PWA | QA workbench and reports |
| **Domain** | NestJS gateway | Site, asset, incident, calibration, audit |
| **Data / pipe** | EMQX + PostgreSQL/Timescale | Telemetry with quality flags |
| **Edge** | Certified sensors + gateway | Local thresholds, offline buffer |

ThingsBoard / DataTalk are optional adapters after evidence, not the default stack. Native mobile apps are not year-one.

**We do not:** million-device consumer IoT, generic smart-home hubs, or rebuilding MQTT from scratch.

## Repositories

| Repo | Visibility | Description |
|------|------------|-------------|
| [platform](https://github.com/syncrobrain/platform) | Private | Meta-repo — spec, plan, contracts |
| [docs](https://github.com/syncrobrain/docs) | Public | RsPress documentation site |
| [iot-gateway](https://github.com/syncrobrain/iot-gateway) | Private | Domain services (JWT, assets, MQTT) |
| [iot-console-web](https://github.com/syncrobrain/iot-console-web) | Private | ColdGuard QA console (React) |
| [website](https://github.com/syncrobrain/website) | Private | Marketing site → [syncrobrain.com](https://syncrobrain.com) |
| [deploy](https://github.com/syncrobrain/deploy) | Private | Docker Compose (Cloud Lite target) |

## LuminaryWorks ecosystem

ColdGuard is sellable on its own. Sibling products are optional:

```text
边缘网关 ──MQTT──► SyncroBrain ColdGuard ──► 可选 DataLuminary · BlockyEdu · VistaRemote
```

DoerFlow / on-chain earnings are not part of the MVP narrative.

## Quick links

- [syncrobrain.com](https://syncrobrain.com)
- [Documentation](https://github.com/syncrobrain/docs)
- [Getting started](https://github.com/syncrobrain/platform/blob/main/ONBOARDING.md)
- [1@zhoulujun.cn](mailto:1@zhoulujun.cn)

<p align="center">
  <sub>Auditable cold storage. Alerts that close.</sub>
</p>
