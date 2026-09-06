# smart-site 跨产品绑定参考合同

> **状态**：reference contract（引用合同，不是新产品，不是 Cloud Lite 前置）。  
> **默认**：全部关闭。未配置连接时 Gateway 必须 no-op，standalone 的 `/ready` 不受影响。  
> **契约**：[`smart-site-binding.schema.json`](../../contracts/schemas/smart-site-binding.schema.json) · [`dataluminary-embed.schema.json`](../../contracts/schemas/dataluminary-embed.schema.json) · [`control-manifest.schema.json`](../../contracts/schemas/control-manifest.schema.json)  
> **部署**：[../deployment.md](../deployment.md) · **生态可选性**：[../ecosystem.md](../ecosystem.md)

「smart-site」是**多产品同场地**的常见组合形态（IoT 资产 + 摄像头 + 远程设备 + 大屏）。本文只做一件事：把 **绑定键** 和 **引用方式** 固定下来，让各产品在实机联调时不再各发明一套 id 对齐规则。

## 1. 谁拥有什么

| 产品 | 拥有 | 在 smart-site 里的引用键 |
|------|------|------------------------|
| SyncroBrain | Project / Site / Asset、Incident、Command、Scene、Safety Kernel | `projectId` · `siteId` · `assetId` |
| VistaCast | 摄像头、视觉检测、`alert.v1` | `tenantId` · `cameraId` |
| VistaRemote | 远程设备会话、远控通道 | `remoteDeviceId` |
| DataLuminary | 大屏 / 看板 / 报表 | `dashboardId` |
| LuminaryWorks | Logto 身份、Entitlement | `subjectId` · `productCode` |

SyncroBrain **不拥有** 视频字节、远控通道、看板渲染。兄弟产品 **不拥有** TB 设备、执行器 RPC、Incident 内核。

- 不共享数据库、不跨仓 runtime import。
- 所有跨产品载荷走[跨产品事件平面](../deployment.md#2-事件平面分离红线)，禁止 TB MQTT topic。
- 绑定里 **只放 id 与显示名**，禁止设备 token、MQTT 口令、TB 管理员凭据、兄弟产品 API key。

## 2. 三层绑定键（稳定合同）

```text
tenant ↔ project        VistaCast/VistaRemote 租户  ↔  SyncroBrain projectId   （1:1，连接级）
camera ↔ asset          VistaCast cameraId          ↔  SyncroBrain assetId     （N:1，绑定级）
remote-device ↔ asset   VistaRemote remoteDeviceId  ↔  SyncroBrain assetId     （1:1，绑定级）
```

| 层 | 唯一性 | 未知 id 的行为 |
|----|--------|---------------|
| `tenant ↔ project` | 一个外部 `tenantId` 只能绑一个 `projectId`（DB 唯一索引） | 拒绝创建连接 |
| `camera ↔ asset` | `(connectionId, cameraId)` 唯一；多个摄像头可指向同一资产 | 事件进隔离队列，**不**自动建设备、**不**触发动作 |
| `remote-device ↔ asset` | `(connectionId, remoteDeviceId)` 唯一；一个资产最多一个远程设备 | 拒绝会话，不建设备 |

规则：

1. 绑定由**已认证操作员**在 Console 创建，需 `iot.integration:manage`。
2. 绑定不隐含动作权限。任何 remote intervention / command 仍要 `iot.command:dispatch` + Safety Kernel（[§4](#4-remote-intervention-与-command)）。
3. 解绑不删除资产、不删除摄像头、不 close Incident。
4. 绑定表必须可导出为审计证据（谁在何时绑定了什么）。

## 3. DataLuminary embed / export 引用合同

**当前实现状态：`DATALUMINARY_EMBED_ENABLED` 默认 `false`，Console 只显示「未接入」。SyncroBrain 尚未交付 iframe 大屏；默认看板仍是 ThingsBoard Dashboard。** 本节是启用时必须满足的合同，不是「已完成」声明。

### 3.1 embed（若启用）

| 要求 | 细则 |
|------|------|
| 短期 token | Gateway 签发，TTL ≤ `DATALUMINARY_EMBED_TTL_SECONDS`（默认 300s，上限 900s），一次性用途、不可续期 |
| origin 白名单 | `DATALUMINARY_EMBED_ORIGINS` 显式列出；不在白名单 → `403`，不接受通配 `*` |
| dashboard 白名单 | `DATALUMINARY_EMBED_DASHBOARDS` 显式列出 `dashboardId`；不在白名单 → `403` |
| 浏览器不持凭据 | token 只携带 `projectId` / `dashboardId` / `exp` / `aud`；**不含** DataLuminary API key、TB 凭据、DB 连接串 |
| 权限 | 需 `iot.integration:view`；签发写审计 |
| 默认关闭 | `DATALUMINARY_EMBED_ENABLED` 非 `true` 时端点返回 `404 INTEGRATION_DISABLED` |

契约：[`dataluminary-embed.schema.json`](../../contracts/schemas/dataluminary-embed.schema.json)、`gateway.v1.yaml` 的 `/integrations/dataluminary/embed-token`。

### 3.2 export（若启用）

| 要求 | 细则 |
|------|------|
| 拉模式 | DataLuminary **拉** Gateway 的聚合导出，SyncroBrain 不推明细遥测 |
| 粒度 | 时间窗 digest / incident report（`syncrobrain.telemetry-digest.v1` · `syncrobrain.incident-report.v1`），不是逐点遥测 |
| 传输 | 签名 HTTPS（跨产品事件平面），禁止 TB MQTT |
| 凭据 | 服务端到服务端；浏览器不参与 |

## 4. remote intervention 与 command

任何来自 smart-site 的干预（VistaCast 视觉触发、VistaRemote 远程按钮、DataLuminary 大屏按钮）**都不是** 新的下发通道：

```text
外部建议 → Entitlement → Casbin(iot.command:dispatch) → ActionPolicy / Safety Kernel evaluateAction
        → Command Outbox（幂等 + 审计） → TB RPC
```

- 兄弟产品回调 **禁止** 直接调 TB RPC，**禁止** 自动 close Incident。
- 互锁 / 雨锁 / kill switch / 速率越界 → fail closed。
- 只允许 Pack 或 Controller Kit **已声明** 的命令；未声明的命令即使 Casbin 放行也拒绝。
- 每次干预写审计：外部来源、绑定键、Safety Kernel 判定、Outbox id。

## 5. 权限

| 动作 | 权限码 |
|------|--------|
| 查看绑定 / embed 状态 | `iot.integration:view` |
| 创建 / 解除绑定、签发 embed token | `iot.integration:manage` |
| 触发命令 | 另需 `iot.command:dispatch` |

Logto SSO 只解决登录。SyncroBrain 与兄弟产品是**两套 audience、两套 Casbin**，token 不互换，业务 ACL 不进 JWT。

## 6. 成熟度

- `camera ↔ asset`：**integration-verified**（已实现，见 [vistacast.md](./vistacast.md)）
- `tenant ↔ project`：**integration-verified**（已实现）
- `remote-device ↔ asset`：**contract-only**（合同已固定，实现未交付）
- DataLuminary embed / export：**contract-only，默认关闭**

对外只按上表宣称，不得把 contract-only 说成已交付。
