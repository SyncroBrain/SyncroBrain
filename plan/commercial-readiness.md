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
| 企微 / 钉钉 / SMS 适配器 | Gateway `NOTIFY_*` + `NOTIFY_CHANNEL_MOCK`；写入多通道 DeliveryAttempt；Console 展示通道状态。**Mock ≠ 真实送达** |
| 离线许可 | 离线 license 写入 / 执法档位（report_only / block）可演示；**不接**中央计费结账 |
| Private 安装文档 | `deploy/INSTALL-PRIVATE.md`、陪装 checklist、交接包 / inventory 导出 |
| 安全红线话术 | 改密、CASBIN、JWT、Postgres 暴露等有文档与 Console 安全提示 |
| 运营脚本 | `offline-soak.sh`（默认 1h）、`backup-restore-live.sh`、`hardware-lab-smoke.sh`（仅软件前置） |

**诚实边界**：上述均属 **软件 Cloud Lite 演示 / 陪装试点**。对方看到的是可安装、可演练、可交接的软件包，**不是**「已在客户现场 7×24 运营验证」的证明。

### 试点 SKU 冻结（报价范围）

| SKU | 含 | 明确不含（除非另签） |
|-----|----|----------------------|
| **cloud-lite** / **private-single** | TB CE + Gateway + Console；Pack 一键；离线许可；Webhook / 通道适配器；陪装文档与交接包 | EMQX / K8s 默认栈；无限定制；**hardware-verified**；未配置凭证前的「真实企微/钉钉/SMS 送达」承诺；支付 / VPP / TMS |
| enterprise-ha | 另附 HA SOW | 同上，外加 HA 未演练项不得口头保证 |

订单表：[legal/ORDER-FORM.md](../legal/ORDER-FORM.md)。范围句须与本节一致。

---

## 2. 缺口现状（对照生产运营宣称）

| 缺口 | 现状 |
|------|------|
| **hardware-verified** | 矩阵仍为 protocol-verified。设计模板（芯片/PCB/行业集成，含非乐鑫）见 [spec/hardware-templates.md](../spec/hardware-templates.md)，**不是**认证。台架清单见 [validation/hardware-lab-checklist.md](./validation/hardware-lab-checklist.md)。**有板前不升级矩阵** |
| **活栈 Isolated E2E 现证** | **2026-09-20**：`pnpm e2e:isolated` **32 passed**；活栈 `E2E_REQUIRE_STACK=1` **32 passed**（见 `spec/release-gates.md`） |
| **备份恢复实演** | **2026-09-20** 活栈 `WRITE_EVIDENCE=1 ./deploy/scripts/backup-restore-live.sh` 通过（非破坏性 dump + 临时库 restore）；证据 [validation/backup-restore-live-last.md](./validation/backup-restore-live-last.md) |
| **真实企微 / 钉钉 / 飞书** | **2026-09-20** Gateway 实发：企微与飞书自定义机器人各一条，`DeliveryAttempt` `wecom`/`feishu` 均为 success（HTTP 200，非 Mock）。密钥只在本机 `iot-gateway/.env`，未入库。SMS 仍未接 |
| **1h 断网离线 soak** | **2026-09-20** `WRITE_EVIDENCE=1 SOAK_SECONDS=3600 ./deploy/scripts/offline-soak.sh` 通过（TB 停服 3600s，Gateway health 全程 200）；证据 [validation/offline-soak-last.md](./validation/offline-soak-last.md) |
| **已签署客户合同** | 法律草稿在 `legal/`；**尚无**≥1 份付费签署合同 |

---

## 3. 退出门槛清单

### A. 「可商用试点」（software-only pilot）— 可开始陪装报价

软件交付基线已齐。下列为**客户现场**勾选（陪装日完成），报价前对内对齐话术即可：

- [ ] 客户机按 Private / 陪装文档装起；health-check 与 Console 可开
- [ ] 安全红线当场完成（改密、CASBIN、JWT、库口令 / 暴露面）
- [x] 黄金路径：Pack 一键 → 模拟遥测 → 告警 Ack → CSV — **软件侧 2026-09-20 E2E 现证**
- [x] Webhook 或 DeliveryAttempt 至少能演示「投递可观测」— Webhook + 多通道适配器 / Mock
- [ ] 交接包或 inventory + pilot checklist 已留给对方（陪装日）
- [x] 合同 / 许可草稿与 **试点 SKU 冻结**（§1）写清不含项 — 见 `legal/ORDER-FORM.md`
- [x] 销售话术与本文第 1–2 节一致（内部对齐）

### B. 「生产运营宣称」

在 A 之外，须**额外**全部满足，才可对渠道 / 招标说「可生产运营」：

- [ ] 目标硬件至少一类标为 **hardware-verified**（台架清单勾完 + 改矩阵；有板后）
- [x] Isolated E2E（或约定等价活栈门）在**声称日附近**有绿跑 — **2026-09-20** isolated + live 各 32 passed
- [x] 至少一条 **真实** 企微或钉钉（国内关键升级路径含 SMS）送达证据，记入 Audit / DeliveryAttempt — **2026-09-20** 企微 + 飞书各一条 success（SMS 仍可选未接）
- [x] 约定时长的离线 / 断网 soak（规格目标含 **≥1h**）有通过记录 — **2026-09-20** `offline-soak-last.md`（3600s）
- [x] 备份恢复演练通过（非破坏性活栈）— **2026-09-20** `backup-restore-live-last.md`；Private / HA 档位仍须与客户合同一致
- [ ] **≥1** 份已签署付费合同（或等效 PO），范围与 SKU 写清
- [x] 值班 / 升级路径与 [spec/reliability.md](../spec/reliability.md) 对齐，通知失败可开单可审计（软件侧）

### 仅余人工 / 实机闸门（AI 无法代替）

1. ~~企微或钉钉（或 SMS）**真实凭证**~~ — **2026-09-20 已勾**：企微 + 飞书实发 success。SMS 仍可选。  
2. ESP32 等**实机台架** → [hardware-lab-checklist.md](./validation/hardware-lab-checklist.md) → 改兼容矩阵  
3. **签署**付费合同 / PO  

（全时长 soak 与备份恢复活栈已于 2026-09-20 有证据。）

---

## 4. 一句话对外口径

> SyncroBrain Cloud Lite **可以**做软件陪装试点报价：Pack、模拟栈、离线许可、Private 安装、投递可观测（Webhook + 企微/钉钉/SMS 适配器）、E2E 现证、备份恢复活栈与 **1h TB 离线 soak** 已齐。  
> **不可以**在未补硬件验证与签署合同前，宣称无限制生产运营。
