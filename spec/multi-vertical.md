# 多垂直 Industry Pack 目录 (v1.0)

> Pack 是版本化制品。不能被 3 个客户复用的改动走专业服务，不打进主版本。  
> Manifest 合同：[contracts/schemas/pack-manifest.schema.json](../contracts/schemas/pack-manifest.schema.json)。  
> 权威默认值若与机器可读副本冲突，以本文件 + 各 Pack 目录 README 为准。

## 1. Pack Factory

每个 Pack 必须包含：

- `manifest.json`（schema 校验）
- TB Device Profile / Rule Chain JSON
- 仿真场景（`simulate[]`）
- 允许命令 + 安全包络（`commands[]` / `safetyEnvelope`）
- 报告列、SOP 摘要、权限码、中英 locale key
- Fake TB 单测 + Playwright 黄金路径（至少一键演示 + 一次越阈 + 确认）

安装前校验：slug/version 唯一、通道 key 稳定、命令 id 在包络内、locale key 在 `en`+`zh` 都存在。升级写审计；失败可回滚到上一 `pack_applications` 行。

## 2. 目录

| slug | 垂直 | 默认 kind | 主要通道 | 验证等级目标 |
|------|------|-----------|----------|----------------|
| `cold-lab` | 实验室冷藏 | `fridge` | temperature, door, power, gateway_online | protocol-verified |
| `env-lab` | Pack 可替换证明 | `room` | temperature, humidity | demo-only（非垂直产品） |
| `cold-food` | 食品冷库 | `cold_room` | temperature, humidity, door, power, energy_kwh | protocol-verified |
| `cold-logistics` | 冷链物流 | `vehicle_box` | temperature, door, gps, shock_g, gateway_online | protocol-verified |
| `ev-charging` | 充电桩 | `charger` | connector_status, power_kw, session_kwh, fault | protocol-verified (OCPP) |
| `energy-storage` | 储能 | `ess` | soc_pct, soh_pct, power_kw, cell_temp_c | protocol-verified |
| `industrial-sensor` | 工业传感 | `sensor` | analog, digital, temperature, pressure, vibration | protocol-verified (Modbus/OPC UA/MQTT) |

## 3. 二开约定

- 领域对象禁止按垂直分叉。新垂直只加 Pack + 适配配置。
- 厂商寄存器表、OCPP vendorId 放 Pack `adapters`，不进 Gateway 实体。
- Console 指标/仿真按钮/命令表单只读 Pack，禁止 `fridge`/`room` 硬编码。
