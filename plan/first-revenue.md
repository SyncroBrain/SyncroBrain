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
| 明确延后 | 熟人演示预约 / 报价触达 | — | **延后** |
| 明确延后 | 公开 docs / SEO / 广告 | — | 延后 |

## 3. 销售钩子（触达重启时再用）

- 7 天内可私有化 IoT 底座（TB CE + Pack + Console）  
- 换 Industry Pack 不换运行时  
- 年支持 + Pack 升级走 SyncroBrain；运行时 Apache-2.0 可审计  

## 4. 关联

[product-iterate.md](./product-iterate.md) · [README.md](./README.md) · [validation/week-1.md](./validation/week-1.md)
