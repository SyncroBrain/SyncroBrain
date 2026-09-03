# BlockyEdu 教育桥接 (v1.0)

> **状态**：Approved — 与公版 Kit / 场景中台同版本  
> **父规格**：[controller-kits.md](./controller-kits.md) · [scenes.md](./scenes.md) · [ecosystem.md](./ecosystem.md)  
> **HTTP**：`contracts/gateway.v1.yaml` `/education-labs/*`；仿真复用 `/demos/{slug}` 与 `/scenes/{id}/evaluate`

## 1. 原则

SyncroBrain **不**新增教育专用设备领域对象。班级实验 = 普通 Project + Pack + Asset + Kit。

BlockyEdu 拥有课程与作品；本产品拥有设备、命令、互锁与审计。

课堂环境 **禁止** `CASBIN_DEV_OPEN=true` 作为生产配置。

## 2. 仿真班级

教师或 BlockyEdu 服务端调用 `POST /demos/{slug}`（`smart-window` / `agri-irrigation` / `agri-pond`）得到隔离 Project。

学生：

- `GET` 资产、通道、Kit、场景
- `POST /scenes/{id}/evaluate` 且 **强制 `dispatch: false`**

学生禁止：删除项目、认领控制器、`POST /assets/{id}/rpc`、`dispatch: true`。

下课：`DELETE /projects/{id}` 或会话 TTL 回收，避免 TB 租户膨胀。

## 3. 角色 `iot_student`

Casbin 角色 `role:iot_student`：

| 允许 | 禁止 |
|------|------|
| `iot.asset:view`、`iot.pack` 目录读取、dry-run evaluate | `iot.asset:manage`、项目删除、claim、设备 RPC |
| 教师授予的项目资源 view | 类型级 `*` 管理 |

开发联调可用 `CASBIN_DEV_STUDENT_SUBS` 把指定 `sub` 映射为学生（即使 `CASBIN_DEV_OPEN=true` 也不升级为 admin）。

## 4. 真机短时会话

`POST /education-labs/sessions`（`iot.asset:manage`）：

- `projectId`、`assetId`、`kitSlug`、`ttlSeconds`（默认 900，最大 3600）
- `allowlist` 必须 ⊆ Kit `safetyEnvelope.allowlist`
- 频率限制与 `killSwitch`
- 过期后意图返回 `LAB_SESSION_EXPIRED`

意图执行走现有 Scene Kernel + `CommandDispatcher`，互锁不可绕过。

错误码：`LAB_SESSION_EXPIRED`、`KIT_MISMATCH`、`COMMAND_DENIED`、`DEVICE_OFFLINE`。

## 5. 参考固件

`firmware/esp32-kit/`：ESP32-C3 / S3 Arduino 工程，`KIT_SLUG` 选择窗/阀/塘/环境节点。生产 MQTT 仍为 ThingsBoard `v1/devices/me/telemetry` 与 RPC。Wi-Fi / Token 仅出现在 `secrets.example.h`。

未实机不得写入兼容矩阵 `hardware-verified` 列。
