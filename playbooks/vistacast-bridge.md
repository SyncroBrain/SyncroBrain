# VistaCast 联动：在界面上接入

> Cloud Lite 可单独运行。本页是操作员点击路径，不是 API 手册。  
> 契约与边界：[spec/integrations/vistacast.md](../spec/integrations/vistacast.md)。  
> VistaCast 侧：[VistaCast docs — 接入 SyncroBrain](https://github.com/VistaCast/vistacast/blob/main/docs/docs/ecosystem/syncrobrain.md)。

成熟度只宣称 **integration-verified**。不要把 VistaCast MQTT 接到 ThingsBoard `:1883`。

## 页面在哪

| 产品 | 地址 | 菜单 |
|------|------|------|
| SyncroBrain Console | `:15180` | **边缘**、**事件**；顶部栏选项目 |
| SyncroBrain Gateway | `:13200` | 无 UI。Webhook 必须打到这里，不是 Console |
| VistaCast Admin | `:13101` | **Webhook**、**摄像头**、**品牌**；看护走 **Care** |

## 没有 VistaCast 时先点一遍

1. 打开 Console → **边缘**。
2. 不必先选项目。点 **仓储演示** / **楼宇演示** / **看护演示**。
3. Console 会新建项目并自动切过去，Inbox 里出现一条 drill。
4. 打开 **事件**：紫色 VistaCast 行可点 **打开预览** / **打开看护**（深链不含 token / secret）。

这只验证 Console ↔ Gateway。真摄像头与签名出站仍要走下面的接入步骤。

## 真接入（两边都开）

### 1. 复制 VistaCast 租户 id

1. 登录 VistaCast Admin。
2. 打开 **Webhook**（或管理员打开 **品牌**）。
3. 复制页面上的 **租户 id**（UUID，不是邮箱）。

### 2. 在 SyncroBrain 创建连接

1. Console 顶部栏选中要联动的项目。
2. 打开 **边缘**。
3. 选场景：仓储/工厂、楼宇设施、或家庭看护。
4. 粘贴租户 id，**自动动作保持关**（看护不可开）。MQTT 仅仓储/楼宇可选，看护禁止。
5. 点 **创建连接**。
6. **立即复制** ingest URL 和一次性 secret（secret 只显示一次）。
7. 点 **打开 VistaCast Webhook**（会预填 URL，不会把 secret 放进地址栏）。

### 3. 在 VistaCast 粘贴并发送 drill

1. URL 应指向 Gateway，例如 `http://127.0.0.1:13200/api/v1/integrations/vistacast/connections/{id}/events`。
2. 把 secret 粘到密钥框（至少 8 位）。
3. 保存，再点 **发送 Drill**。
4. 回到 Console **边缘** Inbox：`processed` 即可；`quarantined` 先绑摄像头再 **重试**。
5. 打开 **事件**，应出现紫色 VistaCast 行。

### 4. 绑定摄像头 ↔ 资产

两边都要写，事件才能对上资产、预览才能打开。

1. VistaCast **摄像头**：复制 **摄像头 id**。
2. Console **边缘** → **绑定摄像头**：连接 + 摄像头 id + SyncroBrain 资产。
3. 点 **到 VistaCast 绑定**：摄像头页会带上资产 id；写入该行的 SyncroBrain 资产 id 并保存。

### 5. 日常使用

- **事件**：紫色行 → **打开预览**（P2P）或 **打开看护**（家庭看护确认倒计时）。
- 自动动作默认关。站点验证过命令后再在连接表里打开。stub 种类（fall / fight / smoke / face.* / staff.*）不会自动下发。
- 家庭看护：只读 Incident，不自动执行器，不 MQTT，不拨急救。

## 三个场景（点完接入后再验）

| 场景 | Profile | 预期 |
|------|---------|------|
| 仓储/工厂 | 仓储 / 工厂 | 入侵打开 Incident；显式启用后才允许警灯 `relayOn`；离线只开单 |
| 楼宇设施 | 楼宇设施 | 危险区与窗/灯同一时间线；下雨时 `open` 仍互锁 |
| 家庭看护 | 家庭看护 | care 只走 Webhook；Incident 深链 `/#/care` |

## 不要做的事

- 不要把 secret 放进 URL / 深链 / 截图外发。
- 不要把 VistaCast MQTT 接到 ThingsBoard `:1883`。
- 不要把 `alert.v1` 写成 TB 遥测。
- 未配置连接时 Gateway 必须 no-op；Cloud Lite 仍可单独部署。
