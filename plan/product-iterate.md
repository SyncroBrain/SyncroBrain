# Product Iterate（当前）

> **决策（2026-08）**：不挂公开 docs 站点。产品仍偏薄，过早对外发布只会抬高期待、分散迭代。  
> Showcase 工程能力保留为**内部演示**；安装说明以私有仓 `deploy/INSTALL.md` + 本地 `docs/` 草稿为准。  
> Build 已冻结：[build-freeze.md](./build-freeze.md)。Showcase 出口见 [showcase-freeze.md](./showcase-freeze.md)。

## 1. 目标

把 Cloud Lite 从「能演示」推进到「愿意拿去给 1–2 个熟人技术买方做闭门试点」——仍**不**对外宣称已发布，**不**部署公开文档站。

## 2. 完成定义（出门进 First Revenue 触达）

| 项 | 标准 |
|----|------|
| 演示稳定 | 冷启动 compose 后，双 Pack 一键 + 遥测 + 告警 Ack + CSV，连续 3 次无手工修库 |
| Console 主路径 | 总览 / 设备 / 告警 / 项目向导可走完；空态与错误可读；不依赖打开 TB UI 才能讲清价值 |
| Pack 体验 | Profile / Rule 行为可解释；至少 1 个参考 Dashboard 或 Console 指标卡可读 |
| 运维底线 | 备份/恢复按 `deploy/OPS.md` 演练过一次；默认口令与 `CASBIN_DEV_OPEN` 口头红线清晰 |
| 许可叙事 | 合同前清单与 Polyform-NC / TB NOTICE 口径一致（见 [licensing.md](../spec/licensing.md)） |
| 对外传播 | **不做**：公开 docs 站点、营销站大改、广告投放 |

未达标前，不把「公开安装教程 / docs Pages」重新列为阻塞项。

## 3. 优先迭代（按序）

| 优先级 | 范围 | 不做 | 状态 |
|--------|------|------|------|
| P0 | Console 主路径打磨：状态、空态、失败提示、双 Pack 入口统一 | 新 Broker / K8s | **已完成** |
| P0 | 告警列表与确认体验；Webhook 失败可见 | 自研完整 Incident 内核 | **已完成** |
| P1 | Pack 可感知：阈值说明、遥测字段、简单看板或统计 | Decoder 市场、第二垂直销售 | **已完成**（manifest 暴露 channels/policy/summary；Console 总览/设备/设置可读） |
| P1 | 部署摩擦：compose 健康检查、首次改密提示、版本清单一键导出 | 完整商业计费 | **已完成**（compose healthcheck · health/inventory · Console 安全横幅与导出 · scripts） |
| P2 | 白牌壳（Logo/标题）草案；离线许可占位 API | Entitlement 生产接线（可占位） | **已完成**（BRAND_* · GET /branding · GET/POST /license · Console 壳与设置页） |
| 明确延后 | 公开 `docs` push / 站点托管 / SEO | — | 延后 |

## 4. 文档策略

| 资产 | 策略 |
|------|------|
| `deploy/INSTALL.md` · `OPS.md` · `SECURITY.md` | **权威安装**（私有仓）；给熟人试点时发链接或附件 |
| 本地 `docs/` 仓草稿 | 可继续改文案，**不 push 当产品发布**，不接公开 Pages |
| `plan/validation/demo-script.md` | 内部 / 闭门演示脚本（**收紧版**；First Revenue 触达用） |
| 公开 GitHub Pages / syncrobrain.com 文档站 | **产品明显厚实后再开**（建议 First Revenue 有真实合同或 Vertical Fit 前再评估） |

## 5. 与下一阶段的关系

- 表内 P0–P2 **已完成**；继续产品补强见 [first-revenue.md](./first-revenue.md)（**触达延后**）。测试入口：`pnpm test:l1`；隔离 Playwright：`pnpm e2e:isolated`。AI 证据包可选、非门。改密口头由 `health.security.codes` 覆盖机器部分。  
- 闭门演示脚本仍维护：[validation/demo-script.md](./validation/demo-script.md)。  
- 公开文档站与熟人报价：**延后**。
