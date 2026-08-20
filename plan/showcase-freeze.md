# Showcase 出口清单

> 对照 [showcase.md](./showcase.md)。**2026-08 决策**：不挂公开 docs 站点；Showcase 以**内部可演示**关闭，后续进 [product-iterate.md](./product-iterate.md)。

| 项 | 状态 | 证据 |
|----|------|------|
| 内部安装说明 | **通过** | `deploy/INSTALL.md`（私有仓权威） |
| 演示文字版 | **通过** | [validation/demo-script.md](./validation/demo-script.md) · 本地 `docs/docs/guide/demo.md` 草稿 |
| `cold-lab` 一键 | **通过** | Console + `POST /demos/cold-lab` |
| `env-lab` Pack + 一键 | **通过** | `iot-gateway/packs/env-lab/0.1-draft` · `POST /demos/env-lab` |
| Console Pack 目录 / 向导可选 | **通过** | `GET /packs` 含 `kind` |
| 首页文案不默认 EMQX | **通过**（草稿） | 本地 `docs/docs/index.md`；**不对外发布** |
| 录屏成片 | **可选** | 不阻塞 |
| 公开 docs push / 站点托管 | **明确不做（本阶段）** | 延后至产品迭代满意后再评估 |
| 阶段门文案 | **已切到 Product Iterate** | [plan/README.md](./README.md) |

## 口头允许（闭门）

- 给熟人技术买方做 Cloud Lite 私有演示  
- TB CE Apache-2.0 + 自研 Polyform-NC  
- Pack 可替换（冷藏 / 环境点）

## 口头禁止

- 「文档站 / 平台已公开发布」  
- EMQX 标配、完整计费、原生 App、K8s  
