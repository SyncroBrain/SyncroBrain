# 商用就绪诚实声明（Software Cloud Lite）

> **用途**：对外话术与内部销售对齐用。本文只陈述**有证据**的软件能力与**明确未就绪**项。  
> **不是**营销页；**不得**据此宣称「已全面商用 / 已过硬件验收 / 已接真实企微短信」。  
> 相关： [first-revenue.md](./first-revenue.md) · [first-revenue-pilot-checklist.md](./first-revenue-pilot-checklist.md) · [validation/fault-drill-checklist.md](./validation/fault-drill-checklist.md) · [spec/reliability.md](../spec/reliability.md)

---

## 1. 软件 Cloud Lite：演示 / 陪装试点路径（已就绪）

以下路径在 **软件-only**（Fake TB / 模拟遥测 / 本机或 Private 安装文档）前提下可复现，可作为 **「可商用试点」** 的软件交付基线——**不是**无限制的生产运营宣称。

| 能力 | 说明 |
|------|------|
| Industry Packs | `cold-lab` / `env-lab` 及多垂直 Pack 可加载；一键演示、设备表、告警主路径可走通 |
| Fake TB + API / 演练门 | Gateway Fake TB API、fault-drill 四场景（超温 / 门磁 / 断电 / 离线）、drill checklist |
| Console 主路径 | 项目向导、告警列表 / Ack / Clear / CSV、设置分区（runtime / webhook / checklist / audit / license / packs） |
| Webhook + DeliveryAttempt | `ALARM_WEBHOOK_URL` 探测；进程内「上次 Webhook」；持久化 `DeliveryAttempt` 列表（Console 设置 → Webhook） |
| 离线许可 | 离线 license 写入 / 执法档位（report_only / block）可演示；**不接**中央计费结账 |
| Private 安装文档 | `deploy/INSTALL-PRIVATE.md`、陪装 checklist、交接包 / inventory 导出 |
| 安全红线话术 | 改密、CASBIN、JWT、Postgres 暴露等有文档与 Console 安全提示 |

**诚实边界**：上述均属 **软件 Cloud Lite 演示 / 陪装试点**。对方看到的是可安装、可演练、可交接的软件包，**不是**「已在客户现场 7×24 运营验证」的证明。

---

## 2. 不得做无限制商用宣称的项（未就绪）

以下任一项未满足时，**禁止**对外说「已生产就绪 / 已硬件验证 / 已通知闭环」：

| 缺口 | 现状 |
|------|------|
| **hardware-verified** | 兼容矩阵以 kit-sim / Fake TB / protocol-verified 为主；ESP32 等参考固件**未**标 hardware-verified |
| **活栈 Isolated E2E 现证** | **2026-09-20** 已补证：`pnpm e2e:isolated` **32 passed**；同日活栈 `E2E_REQUIRE_STACK=1` **32 passed**（见 `spec/release-gates.md`）。声称日若距此过久须重跑。**L1** 同日通过。仍不得据此宣称多垂直完成或 hardware-verified |
| **备份恢复实演** | 已有 `backup.sh` / `restore.sh` 与 **软件语法 drycheck**（`deploy/scripts/backup-restore-drycheck.sh`，已挂 fault-drill）；**尚无**对活栈 Postgres/TB 卷的真实备份恢复勾选记录 |
| **真实企微 / 钉钉 / SMS** | 当前是通用 Webhook POST；**无**已验证的企微机器人 / SMS 适配器真实送达证据 |
| **1h 断网离线 soak** | fault-drill **明确不扩** 1h 断网 / 实机实验室；无 1h offline soak 通过记录 |
| **已签署客户合同** | 法律草稿在 `legal/`；**尚无**≥1 份付费签署合同作为 First Revenue 退出门槛 |

---

## 3. 退出门槛清单

### A. 「可商用试点」（software-only pilot）

全部勾选后方可对**单一试点客户**报价「软件陪装 + 许可 / 支持」，话术须带本节第 2 条缺口声明：

- [ ] 客户机按 Private / 陪装文档装起；health-check 与 Console 可开
- [ ] 安全红线当场完成（改密、CASBIN、JWT、库口令 / 暴露面）
- [ ] 黄金路径：Pack 一键 → 模拟遥测 → 告警 Ack → CSV（或等价交付脚本）
- [ ] Webhook 或 DeliveryAttempt 至少能演示「投递可观测」（未配 URL 须口头说明 skipped）
- [ ] 交接包或 inventory + pilot checklist 已留给对方
- [ ] 合同 / 许可草稿已交律师；**范围写清**：不含 EMQX/K8s/无限定制、不含 hardware-verified、不含真实企微 SMS 承诺（除非另签）
- [ ] 销售话术与本文第 1–2 节一致（内部对齐）

### B. 「生产运营宣称」

在 A 之外，须**额外**全部满足，才可对渠道 / 招标说「可生产运营」：

- [ ] 目标硬件至少一类标为 **hardware-verified**（有现场或台架证据）
- [x] Isolated E2E（或约定等价活栈门）在**声称日附近**有绿跑 — **2026-09-20** isolated + live 各 32 passed（非 2026-09-10 快照）
- [ ] 至少一条 **真实** 企微或钉钉（国内关键升级路径含 SMS）送达证据，记入 Audit / DeliveryAttempt
- [ ] 约定时长的离线 / 断网 soak（规格目标含 **≥1h**）有通过记录
- [ ] 备份恢复演练通过；Private / HA 档位与客户合同一致
- [ ] **≥1** 份已签署付费合同（或等效 PO），范围与 SKU 写清
- [ ] 值班 / 升级路径与 [spec/reliability.md](../spec/reliability.md) 对齐，通知失败可开单可审计

---

## 4. 一句话对外口径

> SyncroBrain Cloud Lite **可以**做软件陪装试点：Pack、模拟栈、离线许可、Private 安装与投递可观测（含 DeliveryAttempt）已齐。  
> **不可以**在未补硬件验证、现证 E2E、真实通知通道、离线 soak 与签署合同前，宣称无限制生产运营。
