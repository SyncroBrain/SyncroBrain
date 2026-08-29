# First Revenue（产品续作 · 触达延后）

> **前置**：Product Iterate 表内 P0–P2 已完成；公开 docs **仍延后**。  
> **决策（2026-08）**：**熟人演示 / 报价触达暂时不做**；继续打磨产品功能。话术、交接包、checklist 材料保留备用。  
> 演示：[validation/demo-script.md](./validation/demo-script.md) · 安装：[../deploy/INSTALL.md](../deploy/INSTALL.md)

## 1. 退出门槛（触达重启后）

| 项 | 标准 |
|----|------|
| 付费 | ≥1 份许可 / 部署 / 年支持合同（可小额）— **不阻塞当前产品迭代** |
| 交付包 | 对方能按 `INSTALL` + 交接包独立冷启动（可陪装一次） |
| 口径 | 合同前清单与 [licensing.md](../spec/licensing.md) 一致；未承诺 EMQX/K8s/完整计费 |
| 证据 | 版本清单 JSON + 演示日记录（可放 `validation/evidence/`，勿提交客户名） |

## 2. 产品补强（按序 · 本阶段）

| 优先级 | 范围 | 不做 | 状态 |
|--------|------|------|------|
| P0–P3 | 演示教练、交接包、话术、陪装、白牌样例、超温/恢复正常窗 | 营销站 / Entitlement 生产 | **已完成** |
| P4 | 设备遥测历史（Console 内可读）；告警批量确认 | 嵌 TB Dashboard | **已完成** |
| P5 | 告警批量清除；总览迷你温湿度趋势；项目/设备删除清理演示数据 | 嵌 TB Dashboard / 公开 docs | **已完成** |
| P6 | Console 一键上报遥测（TB MQTT，REST 回退）；设备在线/有遥测；告警持续时长；Webhook 是否配置可见 | 嵌 TB Dashboard / 设备 RPC 内核 | **已完成** |
| P7 | 持续走步上报填趋势；设备搜索与 Pack 列；设置页 Webhook 探测 | 嵌 TB Dashboard / 设备 RPC 内核 | **已完成** |
| P8 | 告警确认备注；设备 SHARED 设定温度；走步绕设定值；告警搜索 | 嵌 TB Dashboard / 设备 RPC 内核 | **已完成** |
| P9 | Gateway 操作审计（Pack / 告警 / 设定温度 / 一键演示）；总览与设置可见 | 嵌 TB Dashboard / 设备 RPC 内核 | **已完成** |
| P10 | 冷柜开门/关门模拟（门磁遥测 + 即时 WARNING）；走步保留门状态 | 嵌 TB Dashboard / 设备 RPC 内核 | **已完成** |
| P11 | 告警清除备注（对称确认备注）；列表/CSV/Webhook 带 `clearNote`；批量清除带 projectId | 嵌 TB Dashboard / 设备 RPC 内核 | **已完成** |
| P12 | env-lab 超湿模拟（湿度超阈 + 即时 WARNING）；冷柜拒绝（无湿度通道） | 嵌 TB Dashboard / 设备 RPC 内核 | **已完成** |
| P13 | env-lab 湿度 SHARED 设定；走步绕湿度中心；TB 设备 RPC 白名单（ping / 下发设定）；mqtt-sim 应答 | 任意 method 透传 / 持久化 RPC 队列 / 固件通道 | **已完成** |
| P14 | 告警严重度筛选（CRITICAL / WARNING）；总览刷新已应用 Pack 规则链（含 RPC） | 嵌 TB Dashboard / 任意 RPC 透传 | **已完成** |
| P15 | 设置页上次 Webhook JSON 预览（内存快照；对端失败仍可见；目标脱敏） | 嵌 TB Dashboard / Webhook 落库 / 完整 URL 带凭证 | **已完成** |
| P16 | 告警类型筛选（Temperature High / Door Open / Humidity High）；总览当前范围在线台数 | 嵌 TB Dashboard / 自研在线内核 | **已完成** |
| P17 | 告警详情抽屉（TB details JSON / 场景 / 遥测快照）；操作横幅可跳设置页上次 Webhook | 嵌 TB Dashboard / 自研 Incident 内核 | **已完成** |
| P18 | 告警 CSV 导出当前筛选（与表一致：范围/状态/严重度/类型/搜索）；导出全部仍走 Gateway | 嵌 TB Dashboard / 报表内核 | **已完成** |
| P19 | 超温/开门/超湿/仅开告警单后告警范围自动切到仅当前设备；演示教练导出步改走告警页 | 嵌 TB Dashboard / 自研 Incident 内核 | **已完成** |
| P20 | 设备 Pack / 在线状态筛选；总览点在线台数进入设备表对应筛选 | 嵌 TB Dashboard / 自研在线内核 | **已完成** |
| P21 | 告警筛选写入 URL（status / severity / type / scope）；总览待确认跳到对应筛选 | 嵌 TB Dashboard / 自研 Incident 内核 | **已完成** |
| P22 | 项目筛选、设备搜索/选中/详情写入 URL；侧栏切换保留项目；浏览器标题分页面 | 嵌 TB Dashboard / 自研路由内核 | **已完成** |
| P23 | 未登录打开深链登录后回到原页；告警搜索/选中/详情写入 URL；顶栏复制当前链接 | 嵌 TB Dashboard / 自研路由内核 | **已完成** |
| P24 | 操作记录可点进设备/告警；设置页分区（webhook/audit/license）写入 URL 并滚入视口；动作筛选 | 嵌 TB Dashboard / 自研审计内核 | **已完成** |
| P25 | 遥测历史窗口 1h/6h/24h 写入 URL；详情导出当前窗口 CSV；总览趋势跟随同一窗口 | 嵌 TB Dashboard / 时序仓库 | **已完成** |
| P26 | 总览当前项目未关闭告警（点行打开详情、待确认可当场确认）；告警持续时长按秒刷新 | 嵌 TB Dashboard / 自研 Incident 内核 | **已完成** |
| P27 | Header 项目筛选对齐告警计数（总览卡片、侧栏徽章、DemoCoach）；告警页保留全局待确认统计 | 嵌 TB Dashboard / 自研 Incident 内核 | **已完成** |
| P28 | 总览/告警点设备进详情（URL 带 `asset`）；侧栏保留当前设备；演示教练对接陪装 checklist（自动勾 compose/demo） | 嵌 TB Dashboard / 自研路由内核 | **已完成** |
| P29 | 试点交接包写入本机陪装进度；导出自动勾 handoff；安全码对照红线项（改密/CASBIN/JWT/Postgres） | 嵌 TB Dashboard / 自研合规内核 | **已完成** |
| P30 | Header 换项目时丢掉越界的 asset/alarm 深链并回到项目范围；浏览器标题带项目名与待确认数 | 嵌 TB Dashboard / 自研路由内核 | **已完成** |
| P31 | 总览「已落地 Pack」可点进设备筛 Pack；Pack 卡「设备 N」；未关闭告警拆 CRITICAL/WARNING 并深链 | 嵌 TB Dashboard / 自研路由内核 | **已完成** |
| P32 | 黄金路径深链与范围收口：批量确认跟设备范围；侧栏不污染设置 URL；审计带 assetId；版本清单含陪装进度；标题不被白牌覆盖 | 嵌 TB Dashboard / 自研路由内核 | **已完成** |
| P33 | Playwright 黄金路径验收（登录→一键→遥测→超温确认→CSV→深链→交接包；需本地栈，不 mock 运行时） | 嵌 TB Dashboard / CI 无栈即跳过 | **已完成**（2026-08-29 活栈 `E2E_REQUIRE_STACK=1` 通过；CI 无栈仍 skip） |
| P34 | 第二 Pack 与告警闭环自动化：env-lab 超湿、恢复正常窗、清除；复制链接；无栈时 e2e skip（`E2E_REQUIRE_STACK=1` 仍失败） | 嵌 TB Dashboard / 改密口头 / 报价 | **已完成**（同上） |
| P35 | 单元测试 + 一键 verify + AI 验收证据包（rubric/schema + `pnpm acceptance:evidence`；Grok 4.6 High 另审，不把确定性测试冒充 AI） | 嵌 TB Dashboard / 无 key 不阻塞 unit | **已完成**（unit/lint/build/活栈 e2e 以最近一次 evidence 为准；模型审阅见 `plan/validation/acceptance/`） |
| 明确延后 | 熟人演示预约 / 报价触达 | — | **延后** |
| 明确延后 | 公开 docs / SEO / 广告 | — | 延后 |

## 3. 销售钩子（触达重启时再用）

- 7 天内可私有化 IoT 底座（TB CE + Pack + Console）  
- 换 Industry Pack 不换运行时  
- 年支持 + Pack 升级走 SyncroBrain；运行时 Apache-2.0 可审计  

## 4. 关联

[product-iterate.md](./product-iterate.md) · [README.md](./README.md) · [validation/week-1.md](./validation/week-1.md)
