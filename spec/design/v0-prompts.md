# SyncroBrain ColdGuard v0.app 设计提示词

> **用途**：复制下方英文提示词到 [v0.app](https://v0.app) 生成 UI 原型。  
> **依据**：[coldguard.md](../coldguard.md) · [architecture.md](../architecture.md) · 本目录规格。  
> **技术栈**：与 `iot-console-web` 一致 — **Ant Design 6**，不用 Tailwind / shadcn/ui。  
> **更新**：2026-08

## 设计约束（所有页面通用）

| 维度 | 要求 |
|------|------|
| 品牌 | **SyncroBrain** · 产品名 **ColdGuard** · 中文 **万物智脑** · [syncrobrain.com](https://syncrobrain.com) |
| Slogan | *Auditable cold storage. Alerts that close.* |
| 定位 | 实验室冷藏合规监控与事件闭环；**不是**通用 IoT PaaS 能力清单 |
| 受众 | QA / 质量负责人、实验室运营、设施值班；渠道安装员为次要 |
| 技术栈 | React 19 · **Ant Design 6 (`antd`)** · **@ant-design/icons** · react-router-dom · Rsbuild SPA |
| 主题 | `ConfigProvider` + `locale={zhCN}`，`token: { colorPrimary: "#1677ff", colorError: "#ea3636", borderRadius: 8 }` |
| 样式 | 仅用 antd `token` / `style` / `className` 微调；**禁止** Tailwind CSS、shadcn/ui、Lucide |
| 气质 | 受监管实验室、可追责、数据不出园区；避免消费级卡通与「链上收益」 |
| 语言 | 默认中英双语 UI（`zh-CN` 主，`en` 副标题） |
| 生态 | MVP **不**在主视觉放兄弟产品入口、设备总数虚荣指标、或区块链 |

### 每条提示词前缀（建议一并粘贴）

```
IMPORTANT: Use Ant Design 6 (antd) and @ant-design/icons ONLY.
Do NOT use Tailwind CSS, shadcn/ui, Lucide, or Radix.
Wrap app in ConfigProvider with zhCN locale.
Theme token: colorPrimary #1677ff, colorError #ea3636, borderRadius 8.
Use antd Layout, Card, Table, Tag, Button, Space, Row, Col, Menu, Typography, etc.
Do NOT show blockchain, token earnings, ecosystem app store, or device-count vanity metrics as primary KPIs.
```

### 信息架构（控制台）

```text
风险总览 → 事件（确认/升级）→ 资产与传感点 → 校准 → 报告 / 审计导出 → 站点设置
```

不要用「Devices / Telemetry / Rules / Ecosystem」当一级导航主叙事。

---

## 提示词 1：官网 Landing（ColdGuard 结果优先）

```
IMPORTANT: Use Ant Design 6 (antd) and @ant-design/icons ONLY. No Tailwind, no shadcn/ui.
Do NOT lead with MQTT, AI agents, blockchain, or sibling-product grids.

Design a B2B marketing landing page for SyncroBrain ColdGuard (万物智脑 · ColdGuard):
multi-brand laboratory cold-storage compliance monitoring and incident close-loop for CRO / IVD / pharma R&D labs in a single biotech park.

Tech: React SPA, antd 6, @ant-design/icons, ConfigProvider locale zhCN.
Theme token: colorPrimary #1677ff, borderRadius 8.

Structure: Layout Header, Content, Footer. Row/Col, Card, Button, Typography, Table, Tag, Divider, Space.

Header:
- Typography.Title level 4: SyncroBrain
- Typography.Text type="secondary": ColdGuard
- Nav: Product, Audit, Deploy, Pricing
- Button type="primary": 申请试点
- Button: GitHub

Hero:
- Title: 30 天内，把多品牌冷藏设备变成可审计、可告警、可追责的一套系统
- Paragraph: 不更换现有冰箱。降低样本损失风险，把审计取证从数天压缩到数小时。每次异常都有确认、升级和处置记录。
- Primary CTA: 48 小时合规差距诊断
- Secondary CTA: 查看样例报告

Proof tags: 可私有化 · 断网续采 · 校准可追溯 · 标准 MQTT/REST 可迁出

Outcomes (3 Cards):
1. 少损失 — 温度 / 门磁 / 断电 / 网关离线
2. 快审计 — 事件时间线与不可抵赖日志
3. 可追责 — 确认人、升级路径、月度合规报告

NOT a platform capability laundry list. Do NOT mention ThingsBoard UI, DataTalk, DoerFlow, or token rewards.

Who it is for: 园区内民营实验室，20–200 台混品牌冰箱；决策者是 QA。
Who it is not for: 公立医院招标、运输车队、消费级智能家居.

Pricing (3 Cards): 付费 30 天验证 · 标准云版（按受保护资产点）· 私有化 + SLA
Caption: 价格为待验证区间；拒绝免费 POC.

Footer: syncrobrain.com · Polyform-NC 自研代码 · 商业使用需许可
Style: dark Header (#001529), light Content (#f5f5f5), regulated-industry trust.
```

---

## 提示词 2：QA 风险总览（控制台首页）

```
IMPORTANT: Use Ant Design 6 (antd) and @ant-design/icons ONLY. No Tailwind, no shadcn/ui.
Primary KPIs must be risk and close-loop, NOT total devices or MQTT message count.

B2B console home for SyncroBrain ColdGuard, matching iot-console-web (antd 6, Rsbuild).

Layout:
- Layout.Sider collapsible, dark, width 220:
  Logo: SyncroBrain / ColdGuard
  Menu: 风险总览, 事件, 资产, 校准, 报告, 审计, 站点设置
  Icons from @ant-design/icons
- Header: 站点名「园区 A · 中心实验室」, Tag 值班中, user Dropdown Logout
- Content padding 24, maxWidth 1200

Row 1 — 4 Statistic cards:
- 未关闭事件: 3 (warning)
- 超 SLA 未确认: 1 (error)
- 校准将过期(30天): 4
- 受保护资产点: 42 （label 明确为付费资产点，不是注册设备虚荣数）

Row 2:
- Col 16 Card「站点风险热图」: simple table or list of zones with temperature status tags (正常 / 超阈 / 离线)
- Col 8 Card「待我确认」: List of incidents with Ack buttons

Row 3 Card「最近事件」Table:
columns: 严重度 Tag, 资产, 类型(温度/门磁/断电/离线), 开始时间, 状态(open/acked/escalated), 值班人, 操作(确认)
4–6 sample rows for ultra-low freezers and cold rooms. No EV piles, no ecosystem tiles.

Empty state: Empty + Button 发起告警演练

Chinese labels, English tooltip on icon buttons. Dense, QA-trustworthy.
```

---

## 提示词 3：事件时间线（确认 / 升级 / 证据）

```
IMPORTANT: Use Ant Design 6 (antd) and @ant-design/icons ONLY. No Tailwind, no shadcn/ui.
This is the money page: incident close-loop. No remote-desktop or chain links.

Incident detail for ColdGuard.

Breadcrumb: 事件 / INC-2026-0142 · 超低温冰箱-07 温度超阈

Page header:
- Title: -18.4°C 超过 -20°C 下限
- Tags: 严重, 未确认, 温度, 演练|真实 用 Tag 区分
- Buttons: 确认, 升级, 登记处置, 导出证据包
- Do NOT show VistaRemote / DataTalk / 下发任意 RPC as primary actions

Row:
Col 16 Tabs: 时间线 | 遥测 | 处置证据 | 相关校准
- 时间线 Timeline: 超阈开单 → 企微已送达 → 超时未确认 → 升级设施负责人 → …
- 遥测: placeholder line + quality tags (ok / backfill / late)
- 处置: Form 备注 + Upload 照片 + 关闭原因

Col 8:
- Descriptions: 站点, 区域, 资产, 传感点, 策略版本, 开单时间
- Card 升级 SLA: 距下次升级 12 分钟
- Card 通知: 企微 已达, SMS 失败（失败必须可见）

Same dark Sider as overview.
```

---

## 提示词 4：登录页（Logto SSO）

```
IMPORTANT: Use Ant Design 6 (antd) and @ant-design/icons ONLY. No Tailwind, no shadcn/ui.

Minimal SSO login for SyncroBrain ColdGuard console.

Tech: React, antd 6, ConfigProvider zhCN, colorPrimary #1677ff.
Layout: full viewport, background #001529 (solid, no gradient).

Centered Card maxWidth 400:
- Title: SyncroBrain
- Text secondary: ColdGuard · 实验室冷藏合规
- Button primary block: 使用组织账号登录
- Caption: Powered by Logto · syncrobrain.com
- Links: 隐私政策, 文档

No email/password form. No ecosystem product names. No MQTT network hero illustration required.
```

---

## 提示词 5：审计报告与校准记录

```
IMPORTANT: Use Ant Design 6 (antd) and @ant-design/icons ONLY. No Tailwind, no shadcn/ui.
Target user is QA preparing an audit, not an OEM protocol engineer.

Two stacked views in the same console shell (dark Sider: 报告 / 校准).

View A — 月度合规报告:
- Title: 2026-07 中心实验室冷藏合规
- Descriptions: 站点, 期间, 生成人, Industry Pack 版本
- Statistic row: 事件 17, 平均确认时长 11 分钟, 漏报调查 0, 校准超期 2
- Table of incidents with export buttons
- Buttons: 下载 PDF, 导出 CSV（API 可迁出）
- Alert: 审计日志只追加，不可改

View B — 校准:
- Table: 传感点, 资产, 证书编号, 有效期, 状态 Tag(有效/30天内到期/已过期), 厂商
- Button: 登记校准证书
- No Node-RED / ThingsBoard rule-chain marketing copy
```

---

## 提示词 6：站点扩容（租户模板）

```
IMPORTANT: Use Ant Design 6 (antd) and @ant-design/icons ONLY. No Tailwind, no shadcn/ui.

Site expansion wizard for ColdGuard. Founder or channel installer adds assets without a custom branch.

Steps component: 站点信息 → 区域 → 资产与传感点 → 应用 Industry Pack → 告警演练
- Site form: 名称, 时区, 值班表
- Assets table inline editable: 冰箱/冷柜/冷库/网关, 品牌混杂
- Pack Select: 冷藏实验室 v1（阈值/SOP/月报/BOM）
- Final step: Button 发起演练（必须覆盖温度、门磁、断电、网关离线）

Do NOT add "template marketplace" or "publish decoder to all tenants".
```

---

## 使用建议

1. **生成顺序**：Landing → 风险总览 → 事件时间线 → 报告/校准 → 站点扩容 → 登录。
2. **v0 偏好**：每条必须带 IMPORTANT 前缀，或在项目中指定 React + antd。
3. **落地**：生成代码迁入 `iot-console-web`（antd 6 + Rsbuild）。官网迁入 `website` 时以 ColdGuard 结果文案为准，删除平台能力清单。
4. **废止**：旧提示词中的生态四宫格、链上收益、设备 1247 台、VibeEdu/VibeAgent、Flutter App 入口，均不得再作为主视觉。

## 相关文档

| 文档 | 说明 |
|------|------|
| [coldguard.md](../coldguard.md) | 产品承诺与 MVP |
| [samples/monthly-compliance-report.example.md](./samples/monthly-compliance-report.example.md) | 虚构月报（演示用） |
| [industry-pack.md](../industry-pack.md) | 默认阈值与总览口径 |
| [reliability.md](../reliability.md) | 演练与「受保护」条件 |
| [platform-vision.md](../platform-vision.md) | 楔子与红线 |
| [architecture.md](../architecture.md) | Cloud Lite |
| [ecosystem.md](../ecosystem.md) | 独立可售 |
| [licensing.md](../licensing.md) | 许可 |
