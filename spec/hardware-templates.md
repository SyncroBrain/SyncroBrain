# 硬件模板方案（芯片 · 电路板 · 系统集成）

> **状态**：设计模板，给集成商与硬件伙伴选型。软件参考已经在仓库里，供你以后逐板、逐芯片验收。  
> **不是** 已量产 BOM，**不是** `hardware-verified`。`hardware/templates/*/gerber` 是参考光绘，未做 DRC，不能直接当 220 V 安规发行包。  
> 固件合同在 `firmware/kit-core`（本机 `firmware/scripts/test-ports.sh` 可测）。芯片端口：`firmware/ports/beken`、`nordic`、`stm32wl`、`cat1`。乐鑫 Arduino 仍是 `firmware/esp32-kit`。  
> 未按 [hardware-lab-checklist.md](../plan/validation/hardware-lab-checklist.md) 勾完实机之前，[compatibility-matrix.md](./compatibility-matrix.md) 不得把下列型号标成已认证。  
> 通道与命令合同仍以 [controller-kits.md](./controller-kits.md) 与 `spec/kits/*.json` 为准。换芯片不换 Kit key。

SyncroBrain 不自研芯片、不锁死单一模组。现场能买到、能双来源的主流器件都可以走 **公版固件**（Wi-Fi SoC，当前参考实现是乐鑫）或 **协议接入**（任意 MCU / PLC / 蜂窝模组，只要遥测 key 与命令 id 对齐）。

```text
探头 / 执行器
    → 节点电路板（模板 A–F）
    → 回传：Wi-Fi / BLE / Zigbee / LoRa / Cat-1
    → ThingsBoard MQTT  或  EdgeAgent（Modbus / OPC UA / OCPP / GPS）
    → Gateway + Industry Pack + Scene Kernel
    → Console（告警、值班、命令、合规）
```

云侧安全（雨天禁开、干转、低水位禁喷、功率上限）在 Scene Kernel。电路板必须另有本地限位、超时、急停；断网不能只靠云。

---

## 1. 芯片档（市场主流，不限于乐鑫）

按角色选，不按品牌锁 SKU。同一 Kit 允许两条采购路径。

### 1.1 现场节点（传感 + 小功率执行）

| 档 | 代表型号 | 无线 | 适合 | 不适合 |
|----|----------|------|------|--------|
| Wi-Fi 低成本 | **ESP32-C3**（乐鑫，RISC-V） | Wi-Fi 4 + BLE 5 | 窗控、阀、继电器、库内温湿度；现有 `firmware/esp32-kit` | 远距离无 AP 的大田/鱼塘 |
| Wi-Fi 多 I/O | **ESP32-S3** | Wi-Fi 4 + BLE，PSRAM / USB | 多探头、本地屏、冷库分区网关节点 | 纯电池年续航 |
| Wi-Fi 6 / 802.15.4 | **ESP32-C6** | Wi-Fi 6 + Thread/Zigbee 射频 | 棚内密集节点、以后 Matter 类 | 今天参考固件未移植 |
| 国产 Wi-Fi 海量 | **BK7231N / BK7252**（博通集成 Beken）、**BL616**（博流）、**RTL8720**（瑞昱） | Wi-Fi + BLE | 客户已有涂鸦/自有固件时走 **协议路径** | 不要假装已烧录我方 Arduino 参考固件 |
| 电池 BLE | **nRF52840 / nRF5340**（Nordic） | BLE 5 / Mesh | 门磁、周转箱温度记录仪 | 直接驱动 24 V 泵 |
| Zigbee / Thread | **EFR32MG24**（Silicon Labs）、**CC2652**（TI） | 802.15.4 | 楼宇已有 Zigbee 网关 | 无协调器的单点冷库 |
| LoRa 节点 | **STM32WL55**（ST）或 MCU + **SX1262** | LoRaWAN | 大田、山塘、无公网棚区 | 秒级闭环 RPC（时延与占空比） |
| 国产 MCU + 外置无线 | **CH32V307 / CH32V203**（沁恒）+ Wi-Fi 或 4G 模组 | 由模组决定 | 成本敏感、协议路径、RS485 从站 | 未做我方参考固件 |

### 1.2 广域回传（冷链车、偏远鱼塘、大田）

节点 MCU 任选上表，射频用模组，不把基带做进 SyncroBrain：

| 档 | 代表模组 | 制式 | 典型现场 |
|----|----------|------|----------|
| Cat-1 / Cat-1 bis | 移远 **EC800 / EG800**、芯讯通 **A7670**、有方 **N58** | 4G，国内冷链与农网常用 | 冷藏车、周转箱、塘边增氧 |
| NB-IoT | 移远 **BC28 / BC95**、芯讯通 **SIM7020** | 低频小包 | 只上报温度/门，不要求秒级关阀 |
| Wi-Fi 模组（非 SoC 方案） | 移远 **FC41D** 等 | 串口 AT | 客户 MCU 已定、只补无线 |

GPS：车载/箱体用独立 GNSS（如 AT6558 类或模组内置），通道 key 仍是 `gps`，见 `kit-cold-trk`。

### 1.3 站点网关（汇聚，不跑 Kit 传感器固件）

| 档 | 代表 | 跑什么 |
|----|------|--------|
| 低成本汇聚 | ESP32 + RS485（`kit-gw-esp`） | 少量 Modbus 子设备 → TB MQTT |
| 协议边缘 | 工控机：**Intel N100** 无风扇盒，或 **RK3568** | `iot-edge-agent`：Modbus、OPC UA、OCPP、GPS |
| 备选计算 | Raspberry Pi **CM4** | 同上；注意工业温度与供电，不作为冷库唯一网关承诺 |

充电桩主协议、储能 PCS/BMS **不**做进节点 PCB，走 EdgeAgent。节点只做辅热、照明、门禁类 Kit。

---

## 2. 电路板模板

下列是 **功能框图、KiCad 源文件和参考 Gerber**。重新生成：`python3 hardware/tools/build_templates.py`。连接器、爬电距离、安规（尤其 220 V）由硬件伙伴按目标市场认证。双来源：继电器、推杆、阀、无线模组至少两家。

公共约束（所有模板）：

- MCU 3.3 V；执行器 12 V 或 24 V，**电源隔离或至少继电器/光耦隔离**。
- 传感器线：TVS + 串联电阻；冷库冷凝、鱼塘潮湿要三防漆或灌封。
- 天线净空：模组天线区不铺铜、不压电池与金属；冷库金属舱用 **外置天线**，不要靠芯片板上的陶瓷天线穿损。
- 本地急停：一路干接点拉低 = 立即停执行器（参考固件 GPIO 9）。
- 看门狗与掉电复位；执行器命令有 `maxOnSec`，硬件超时作为第二道。
- 遥测 key 只用 Kit 通道名，禁止私自改名。

### 模板 A — 环境传感节点

对应 `kit-env-node`。冷库温湿度、土壤、雨量、光照、门磁（门磁也可单独电池 BLE）。

```text
探头(I2C / 1-Wire / ADC / 干接点)
        │ TVS
   [ MCU 或 Wi-Fi SoC ]
        │
   3.3 V LDO ← 5 V USB 或 12 V 隔离模块
        │
   天线 / 可选 RS485
```

无执行器命令。校准走平台 `Calibration`，不在板上做隐藏偏移。

### 模板 B — 四路继电器

对应 `kit-rly-4ch`。除霜电热、灯、备用泵、喷淋。

```text
MCU GPIO → 晶体管/达林顿 → 继电器线圈（续流二极管）
                              └── 触点：12/24 V 负载，与 MCU 地隔离
可选：电流互感 → ADC → current_a
```

每路独立 `relay_1`…`relay_4`。禁止一块板无通道号地「全开」。

### 模板 C — 推杆 / 窗机

对应 `kit-win-act`。电动窗、温室顶窗、冷库自然通风口。

```text
开/关限位（干接点）──► MCU
MCU ──► H 桥或双继电器 ──► 12/24 V 推杆
可选：雨量干接点、电机电流
```

限位到位必须停。行程超时停机。雨天默认不许开，云侧互锁失败时固件仍应拒绝在 `rain=1` 时执行 `open`（与 Scene 一致）。

### 模板 D — 阀 / 泵

对应 `kit-valve-8z`、`kit-pond-ctrl` 的功率级。

```text
MCU → 阀驱动（MOS 或继电器）× N
MCU → 主泵 / 增氧 / 喷泵（较大继电器或接触器）
流量脉冲 / 水位开关 / 溶氧变送器(4–20 mA 经隔离 ADC) → MCU
```

灌溉：无流量且泵已开超过干转时间则停泵。鱼塘：水位低于阈值禁止喷泵。溶氧探头建议 4–20 mA 隔离，不要长线直连 MCU ADC。

### 模板 E — 冷链追踪

对应 `kit-cold-trk`。

```text
温度探头 + 门磁 + 冲击（可选）
        │
   MCU + Cat-1 模组 + GNSS
        │
   可充电锂电池 + 车载/箱内 5–36 V 宽压
        │
   断网缓存 → 上线 quality=backfill（信封见遥测合同）
```

无稳定 Wi-Fi。NB-IoT 只用于低频温度；要围栏与补传优先 Cat-1。

### 模板 F — 能源辅控（非主功率）

充电棚风机、储能舱排热、照明。对应 `kit-fan-pwm`、`kit-rly-4ch`。

主回路（枪、PCS、BMS、计费）**不在此板**。风机 PWM 或 0–10 V 经隔离。AI 不得一次把风机打满以外的主功率命令从这块板发出。

### 模板 G — 现场汇聚

`kit-gw-esp` 或工控机 + EdgeAgent。

```text
子设备 RS485 / 干接点
        │ 隔离 485
   ESP32 网关  或  N100/RK3568
        │ Ethernet 或 4G
   ThingsBoard / Gateway
```

OCPP、OPC UA、多主站 Modbus 用工控机，不用 ESP32 硬扛。

---

## 3. 行业通用方案

每一行都是「节点模板 + 回传 + 平台 Pack」。集成商可以换芯片档，不能换通道合同。

### 3.1 智慧农业（灌溉 / 温室）

| 项 | 选择 |
|----|------|
| Pack | `agri-irrigation`；温室通风可加 `smart-window` |
| Kit | `kit-valve-8z` + `kit-env-node` + 可选 `kit-rly-4ch`、`kit-fan-pwm`、`kit-win-act` |
| 棚内芯片 | ESP32-C3 或 S3；已有海量 Wi-Fi 模组则协议接入 BK7231 / BL616 |
| 大田无 Wi-Fi | STM32WL / SX1262 LoRa 到棚内网关，或 Cat-1 直连 |
| 电路板 | 模板 A（土壤、雨量）+ 模板 D（分区阀与主泵） |
| 平台 | 土壤低 → `zoneOn`；降雨 → 停；无流量 → 干转停泵。Console 认领 `bindPath=official` 或 `protocol` |

### 3.2 智慧渔业（鱼塘增氧 / 喷水）

| 项 | 选择 |
|----|------|
| Pack | `agri-pond` |
| Kit | `kit-pond-ctrl` + `kit-env-node` |
| 芯片 | 塘边通常无稳定 Wi-Fi：**Cat-1 模组 + ESP32-C3 或 CH32**；溶氧变送器走 4–20 mA |
| 电路板 | 模板 D；增氧与喷泵分继电器；水位开关独立于云 |
| 平台 | 低溶氧开增氧；低水位 **禁止**喷泵。不断电策略要有本地 `maxOnSec` |

### 3.3 冷库 / 食品冷链（库内）

| 项 | 选择 |
|----|------|
| Pack | `cold-lab`、`cold-food` |
| Kit | `kit-env-node` + 可选 `kit-rly-4ch`（除霜）+ 可选 `kit-win-act`（自然通风口） |
| 芯片 | 库内 Wi-Fi：**ESP32-C3** 节点 + **外置天线**；分区多时 S3 或模板 G 汇聚。门磁可用 nRF52840 电池节点，经网关汇入同一资产或相邻资产 |
| 电路板 | 模板 A（温度、门、断电检测干接点）+ 模板 B（除霜）。探头线按冷库长度加 TVS，变送器优先 4–20 mA |
| 平台 | 超温 / 门开 / 断电开 Incident；值班与演练门通过后才可谈「受保护」。合规 CSV 在 Console，不在 MCU |

### 3.4 冷链物流（车 / 箱）

| 项 | 选择 |
|----|------|
| Pack | `cold-logistics` |
| Kit | `kit-cold-trk` |
| 芯片 | 模板 E：MCU + 移远/芯讯通 Cat-1 + GNSS。不要用纯 NB 承诺围栏实时 |
| 电路板 | 宽压、电池、断网缓存 |
| 平台 | 温度、门、冲击、GPS 围栏；上线补传。不做运单与运费清分 |

### 3.5 楼宇 / 设施窗控

| 项 | 选择 |
|----|------|
| Pack | `smart-window` |
| Kit | `kit-win-act` + `kit-env-node` |
| 芯片 | ESP32-C3（参考固件已覆盖）；楼宇已有 Zigbee 则 EFR32 / CC2652 走协议路径 |
| 电路板 | 模板 C |
| 平台 | 手动开闭；雨关；高温开缝。参考固件见 [firmware/esp32-kit/README.md](../firmware/esp32-kit/README.md) |

### 3.6 充电与储能（仅辅控）

| 项 | 选择 |
|----|------|
| Pack | `ev-charging`、`energy-storage` |
| 主设备 | OCPP 桩、PCS/BMS → EdgeAgent，**不是** ESP32 替换桩控 |
| 辅控 Kit | `kit-fan-pwm`、`kit-rly-4ch` |
| 芯片 | 辅控 ESP32-C3；站点网关 N100 / RK3568 |
| 电路板 | 模板 F + 模板 G |
| 平台 | 故障、功率上限、安全启停在 Pack；**不含**支付、互联互通结算、VPP |

### 3.7 工业传感器

| 项 | 选择 |
|----|------|
| Pack | `industrial-sensor` |
| 接入 | 客户 PLC / 仪表 Modbus 或 OPC UA → 模板 G。只有离散量时才用模板 A/B |
| 芯片 | 不替换 PLC。可选 CH32 或 STM32 做协议网关从站 |
| 平台 | 模拟量/数字量告警；质量 `unmapped` 时不得当已映射点运行 |

---

## 4. 系统集成（从板到 Cloud Lite）

1. **选型**：按 §3 定模板与芯片档；写双来源，不写进兼容矩阵。
2. **固件或协议**：Wi-Fi 公版走 `firmware/esp32-kit`（`KIT_SLUG` 对齐 Kit）；其它芯片实现同一遥测 key 与 TB RPC `method`，或经 EdgeAgent 映射。主题仍是 `v1/devices/me/telemetry` 与 RPC，禁止第二套 topic。
3. **认领**：Console 公版控制器，`bindPath=official|protocol`。
4. **Pack**：项目应用对应 Industry Pack；场景评估在云侧，本地互锁在板侧。
5. **验收**：先 [controller-bench.md](../playbooks/controller-bench.md) 仿真；实机再勾硬件清单。通过前销售材料只能写「模板 / 协议已仿真」，不能写「该芯片已硬件认证」。

```mermaid
flowchart LR
  pcb [NodePcb_AtoF]
  radio [WiFi_BLE_LoRa_Cat1]
  tb [ThingsBoard]
  edge [EdgeAgent]
  gw [Gateway_SceneKernel]
  ui [Console]
  pcb --> radio
  radio --> tb
  radio --> edge
  edge --> tb
  tb --> gw
  gw --> ui
```

---

## 5. 明确不做

- 自研 ASIC、自研射频基带、单模组独家锁货。
- 把未实机型号写成 `hardware-verified` 或写入对外「已兼容硬件」表。
- 用节点 PCB 替代充电计费、电力市场、WMS、TMS、农事 ERP。
- 冷库/鱼塘里依赖「只有云能停机」的执行器。
