# SyncroBrain × VistaCast 联动

> **状态**：optional addon（integration-verified）  
> **不是** Cloud Lite 前置依赖。未配置连接时 Gateway 必须 no-op。  
> **契约**：[`alert.v1`](../../contracts/schemas/alert.v1.schema.json) · [`external-event-profile.schema.json`](../../contracts/schemas/external-event-profile.schema.json) · [`gateway.v1.yaml`](../../contracts/gateway.v1.yaml)

## 1. 边界

| 产品 | 拥有 | 不拥有 |
|------|------|--------|
| VistaCast | 摄像头、检测、告警状态、P2P 预览、签名出站 | IoT 资产、执行器 RPC、ThingsBoard |
| SyncroBrain | 项目/站点/资产、Incident、Scene Kernel、命令 Outbox | 视频字节、WebRTC、视觉模型 |

- 不共享数据库、不跨仓运行时 import。
- 不把 `alert.v1` 写入 ThingsBoard `v1/devices/me/telemetry`，不伪造 TB Alarm。
- 视觉事件只能触发 Pack/Kit 已声明的命令，仍过互锁、kill switch、幂等与审计。
- 家庭 `care` **只走签名 Webhook**；MQTT 总线禁止看护载荷。

## 2. 投递平面

```text
VistaCast alert.v1
  ├─ POST HMAC Webhook  →  SyncroBrain Inbox   （三个场景的生产入口）
  └─ MQTT lw/v1/{tenantId}/vistacast/alert.v1   （仓储/楼宇可选；独立 EVENT_BUS_MQTT_URL）
```

Webhook 路径：`POST /api/v1/integrations/vistacast/connections/{id}/events`  
请求头：`x-vistacast-signature: sha256=<hex>`，对 **原始 body 字符串** HMAC-SHA256。无需用户 JWT。

## 3. 关联键

1. 连接：VistaCast `tenantId` ↔ SyncroBrain `projectId` + Profile。
2. 绑定：VistaCast `cameraId` ↔ SyncroBrain `assetId`（VistaCast 侧另有 `syncrobrainDeviceId` 字符串）。
3. 未知租户/资产进入隔离队列，不创建设备、不触发动作。

## 4. Profile

| slug | 场景 | MQTT | 默认可自动动作 | 说明 |
|------|------|------|----------------|------|
| `industrial-safety` | 仓储/工厂 | 允许 | 关 | 入侵可开 Incident；显式启用后才可 `relayOn` 警灯 |
| `building-facility` | 楼宇设施 | 允许 | 关 | 危险区与窗/灯同一站点时间线；视觉自动可 `close`；`open` / `setPosition` 仍受雨锁 |
| `home-care` | 家庭看护 | **禁止** | 关（且不可开） | 只读 Incident + 深链 VistaCast care；不拨急救 |

`fall` / `fight` / `smoke` / `face.*` / `staff.*` 为 stub：默认仅仿真或人工确认。

成熟度只宣称 **integration-verified**。视觉模型与执行器实机仍走各自验证门。

## 5. 权限

- SyncroBrain：`iot.integration:view` / `iot.integration:manage`；动作另需 `iot.command:dispatch`。
- VistaCast：`camera:edit`、`webhook:*`、`stream:view`、`care:view`。
- Logto SSO 只解决登录；两个 audience 与两套 Casbin 不互换 token。

## 6. 在界面上接入

操作员不需要调 API。点击路径见 [playbooks/vistacast-bridge.md](../../playbooks/vistacast-bridge.md)。

1. VistaCast **Webhook** / **品牌**：复制租户 id。
2. SyncroBrain Console **边缘**：选项目与场景，粘贴租户 id，创建连接，复制 ingest URL 与一次性 secret。
3. 点 **打开 VistaCast Webhook**（只预填 URL），粘贴 secret，**发送 Drill**。
4. 绑定摄像头 id ↔ 资产；可选 **到 VistaCast 绑定** 写入同一资产 id。
5. Console **事件**：紫色 VistaCast 行打开预览或看护。

没有 VistaCast 时，在 **边缘** 点仓储/楼宇/看护演示，会新建项目并写入一条 drill Incident。

Webhook 必须打到 Gateway `:13200`，不是 Console `:15180`。深链不得携带 secret。
