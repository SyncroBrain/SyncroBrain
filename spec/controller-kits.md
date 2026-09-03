# 公版控制器（Controller Kit）

> **状态**：Multi-Vertical Production 扩展。Kit 是可复用的硬件+固件+通道合同，不是垂直 Pack，也不是自研芯片。  
> 机器可读目录：[`spec/kits/`](./kits/) · Schema：[controller-kit.schema.json](../contracts/schemas/controller-kit.schema.json)。  
> 场景中台：[scenes.md](./scenes.md)。Pack 组合方式：[multi-vertical.md](./multi-vertical.md)。

SyncroBrain 做 **IoT 平台**。公版控制器是给集成商与项目现场的 **参考解决方案**：同一套通道、命令、安全包络，可以烧录我们的参考固件，也可以只用协议把第三方设备接到平台。

```text
用户设备
  ├─ 公版路径：ESP32 参考固件 ──TB MQTT──► ThingsBoard ──► Gateway / Scene Kernel
  └─ 协议路径：自有 MCU / PLC ──MQTT / Modbus / OPC UA──► EdgeAgent ──► 同一通道 Schema
                    │
                    ▼
            Industry Pack（冷链 / 楼宇窗控 / 灌溉 / 鱼塘 …）
            只组合 Kit，不按垂直分叉领域对象
```

## 1. 为什么是 Kit，而不是再做一个垂直

| 层 | 拥有 | 不拥有 |
|----|------|--------|
| **Controller Kit** | MCU 级别、I/O、通道 key、命令 id、本地安全包络、参考 BOM 原则、两种绑定路径 | 行业 SOP、值班、合规报告、品牌主 UI |
| **Industry Pack** | 组合哪些 Kit、阈值/场景配方、看板、AI 包络、报告列 | 寄存器方言（放 `adapters`） |
| **平台（Gateway + TB）** | 项目/站点/资产、命令投递、Incident、认领、许可 | 替代 TB Transport；自研 Broker |

窗控、灌溉、鱼塘增氧、冷库除霜，底层都是 **传感 + 开关/行程执行器**。做成公版 Kit 后，冷链物流的箱体追踪、食品冷库的除霜泵、充电站的辅助风机都可以复用，而不是每个垂直复制一套 GPIO 逻辑。

领域对象禁止按垂直分叉（见 [multi-vertical.md](./multi-vertical.md) §3）。新执行器只加 Kit；新行业只加 Pack。

## 2. 两条接入路径

| 路径 | 谁提供硬件 | 平台要求 | 验证等级 |
|------|------------|----------|----------|
| **公版（official）** | 渠道按 Kit BOM 采购模组；固件实现本文通道与 RPC | 认领（序列号/二维码）后自动套 Kit Schema | 仿真 `protocol-verified`；实机后才 `hardware-verified` |
| **协议（protocol）** | 客户自有 ESP32 / PLC / 厂商网关 | 遥测 key 覆盖 Kit `channels[].key`；命令映射到同一 `commands[].id` | 同一通道合同；方言只写 Pack `adapters` |

两条路径在 Console 里都显示为同一资产 kind。禁止为公版单独做一套 MQTT topic。生产路径仍是 ThingsBoard MQTT API（`v1/devices/me/telemetry` / RPC），见 [architecture.md](./architecture.md) §6.3。

**不做**：自研芯片、锁死单一模组 SKU、消费级百万在线 App 生态（涂鸦式 C 端）。项目级别墅、温室、鱼塘、冷库、园区楼宇在范围内。

## 3. MCU 与 BOM 原则

- 默认 MCU **级别**为 **ESP32 类**（Wi-Fi；可选 4G DTU 挂在网关侧）。选型以现场能买到的模组为准（如 ESP32-C3 / ESP32-S3 级），**不写未实机的具体品牌型号**。
- 执行器电源与 MCU 隔离：12/24 V 继电器或 H 桥；限位、过流、干转必须有硬件或固件互锁，不能只靠云端。
- **双来源**：模组、继电器、推杆/阀至少两条采购路径。具体型号在设计伙伴现场后写入 Kit `1.0` BOM 表。
- 不卖自有芯片；硬件合同走渠道。参考固件是通道合同的实现，不是锁定手段。
- 公版固件只允许 Pack 声明的命令；kill switch 与 `maxOnSec` 在边缘生效（云断仍安全）。

## 4. 公版目录（v0.1-draft）

权威机器副本在 `spec/kits/<slug>.json`。下表是产品说明；冲突以 JSON + 本文为准。

### 4.1 `kit-win-act` 窗控 / 通风口执行器

| 项 | 内容 |
|----|------|
| 现场 | 电动窗、遮阳、温室顶窗、冷库自然通风口 |
| 硬件 | ESP32 + 双继电器或 H 桥 + 开/关限位；可选雨量/风压 |
| 通道 | `position_pct`、`limit_open`、`limit_close`、`rain`、`motor_current_a`、`gateway_online` |
| 命令 | `open`、`close`、`stop`、`setPosition`（0–100） |
| 安全 | 行程超时 `maxOnSec=120`；雨天默认禁止 `open`（站点可覆盖）；限位到位必须停机 |
| 控制 | 远程手动；雨关/高温开缝为策略自动；天气建议为 AI（须有雨量或温度证据） |

### 4.2 `kit-rly-4ch` 四路开关

| 项 | 内容 |
|----|------|
| 现场 | 浇水、喷淋、增氧、灯、除霜电热、通用泵 |
| 硬件 | ESP32 + 4 路继电器；可选单路电流互感 |
| 通道 | `relay_1`…`relay_4`（bool）、`current_a`、`gateway_online` |
| 命令 | `relayOn` / `relayOff`（`ch` 1–4）+ `durationSec` |
| 安全 | 每路 `maxOnSec`（默认 3600）；命令必须带通道号；AI 不得一次全开 |
| 复用 | 冷库除霜、充电棚照明、鱼塘备用泵都可以绑这一只 Kit |

### 4.3 `kit-valve-8z` 分区阀控

| 项 | 内容 |
|----|------|
| 现场 | 大田/温室分区灌溉、补水 |
| 硬件 | ESP32 + 最多 8 路电磁阀/电动球阀 + 1 路主泵；可选流量脉冲 |
| 通道 | `valve_1`…`valve_8`、`pump`、`flow_lpm`、`soil_pct`（可来自 `kit-env-node`） |
| 命令 | `zoneOn` / `zoneOff`、`pumpOn` / `pumpOff` |
| 安全 | 阀开必须主泵允许；无流量且泵已开超过 `dryRunSec` 则停泵；雨量互锁可跳过本轮 |

### 4.4 `kit-pond-ctrl` 鱼塘增氧 / 喷水

| 项 | 内容 |
|----|------|
| 现场 | 鱼塘增氧、喷水降温、循环 |
| 硬件 | ESP32 + 增氧机/喷水泵继电器；溶氧、水位、水温探头（可拆到 `kit-env-node`） |
| 通道 | `do_mgl`、`water_temp_c`、`water_level_m`、`aerator`、`sprayer` |
| 命令 | `aeratorOn` / `aeratorOff`、`sprayOn` / `sprayOff` |
| 安全 | 水位低于 `minLevelM` **禁止**喷泵（干转）；溶氧低才允许策略自动开增氧；`maxOnSec` 防长时间空转 |

### 4.5 `kit-env-node` 环境传感节点

| 项 | 内容 |
|----|------|
| 现场 | 所有垂直的传感侧：空气温湿度、土壤、光照、雨量 |
| 硬件 | ESP32 + 可插拔探头（I2C/1-Wire/ADC） |
| 通道 | `temperature`、`humidity`、`soil_pct`、`illuminance_lux`、`rain`、`gateway_online` |
| 命令 | 无执行器命令（只上报）；校准走领域 `Calibration` |
| 复用 | 窗控雨感、灌溉土壤、冷库温湿度、冷链箱体温度都可以绑 |

### 4.6 `kit-cold-trk` 冷链箱体追踪

| 项 | 内容 |
|----|------|
| 现场 | 车辆/周转箱冷链 |
| 硬件 | ESP32（或同级）+ 温湿度 + 门磁 + GPS + 可选冲击 |
| 通道 | `temperature`、`humidity`、`door`、`gps`、`shock_g`、`gateway_online` |
| 命令 | 无强制执行器；可选 `lock` 若现场有电子锁（须 Pack 声明） |
| Pack | 被 `cold-logistics` 引用；Edge GPS 协议见 [edge-agent.md](./edge-agent.md) |

### 4.7 `kit-fan-pwm` 风机 / 通风

| 项 | 内容 |
|----|------|
| 现场 | 温室强排、冷库通风、充电棚排热、畜舍 |
| 硬件 | ESP32 + PWM 或 0–10 V / 继电器档位 |
| 通道 | `fan_pct`、`temperature`、`humidity`、`gateway_online` |
| 命令 | `setFan`（0–100） |
| 安全 | 上限默认 100；AI 步进建议 ≤20 个百分点/次；停机必须能到 0 |

### 4.8 `kit-gw-esp` ESP32 现场网关

| 项 | 内容 |
|----|------|
| 现场 | 把 485/GPIO 子设备汇聚到 TB MQTT |
| 硬件 | ESP32（Wi-Fi）或 ESP32 + 4G DTU；下行 Modbus RTU |
| 通道 | `gateway_online`、子设备经 EdgeAgent 展开 |
| 说明 | 与 `iot-edge-agent` 互补：极低成本现场用本 Kit；OCPP/OPC UA/多协议用 EdgeAgent |

## 5. 与 Industry Pack 的组合

| Pack | 组合的 Kit | 典型场景 |
|------|------------|----------|
| `smart-window` | `kit-win-act` + `kit-env-node` | 远程开关窗；雨关；高温开缝；AI 天气建议 |
| `agri-irrigation` | `kit-valve-8z` + `kit-rly-4ch` + `kit-env-node` | 分区灌溉、土壤阈值、雨停 |
| `agri-pond` | `kit-pond-ctrl` + `kit-env-node` | 溶氧增氧、高温喷水降温 |
| `cold-lab` / `cold-food` | `kit-env-node` + 可选 `kit-rly-4ch`（除霜） | 原冷藏闭环；执行器不再另起炉灶 |
| `cold-logistics` | `kit-cold-trk` | 箱体温度 + GPS + 门 + 冲击 |
| `ev-charging` / `energy-storage` | 可选 `kit-fan-pwm`、`kit-rly-4ch` | 辅助排热/照明；主设备仍走 OCPP/BMS |
| `industrial-sensor` | `kit-env-node` 或协议路径 PLC | 客户自带仪表时走 protocol bind |

不能被 3 个客户复用的改线、非标行程、专用阀岛走专业服务，不打进 Kit / Pack 主版本。

## 6. 认领与绑定（平台）

```text
POST /api/v1/projects/{id}/controllers/claim
  { kitSlug, bindPath: official|protocol, serial?, protocol?, adapter? }
```

| `bindPath` | 行为 |
|------------|------|
| `official` | 校验序列号前缀/认领码；写入资产 `metadata.kitSlug`；套 Kit 通道与命令 |
| `protocol` | 校验上报 key 覆盖 Kit 必选通道；缺 key 则 `quality=unmapped`，禁止把站点标已上线 |

认领必须写 AuditEvent。解绑不删除历史遥测。同一物理设备不得同时绑两个 Kit slug（通道冲突）；要换 Kit 先解绑。

Gateway HTTP 合同：[gateway.v1.yaml](../contracts/gateway.v1.yaml) `/controller-kits`、`/controllers/claim`、`/scenes`。运行时实现：边缘 Scene Kernel（本仓 `iot-edge-agent`）；云编排在 `iot-gateway`（子仓）落地同一 Schema。

## 7. 参考固件合同（ESP32 ↔ TB）

固件 **不** 实现第二套生产 topic。

| 方向 | TB API | 载荷 |
|------|--------|------|
| 上行 | `v1/devices/me/telemetry` | Kit 通道 key → 数值（bool 用 0/1） |
| 属性 | `v1/devices/me/attributes` | `kitSlug`、`fwVersion`、`bindPath` |
| 下行 | TB RPC | `method` = 命令 id（如 `setPosition`），`params` 为 JSON |

边缘把 RPC 接到 `CommandDispatcher` 同一 `commandId`。LLM 禁止拼 topic。示例连接器：`iot-edge-agent/examples/esp32-window-connector.mjs`。

## 8. 版本

| 版本 | 何时 |
|------|------|
| `0.1-draft` | 现在；通道与命令冻结意图，BOM 无具体 SKU |
| `1.0` | 至少 1 条公版路径 + 1 条协议路径在仿真闭环通过，且 3 个项目能共用通道 key |
| `2.0` | 打破通道 key 或命令 id |

验证等级与兼容矩阵：[compatibility-matrix.md](./compatibility-matrix.md)。未实机型号不得出现在销售材料的「已兼容」列。

## 9. 台架顺序

先仿真再买件：[playbooks/controller-bench.md](../playbooks/controller-bench.md)。Console 一键演示 + 上报遥测 + 场景评估即可跑通协议；`pnpm --dir iot-gateway mqtt:sim -- --profile smart-window --asset-id <uuid>` 是假设备、真 TB MQTT。
