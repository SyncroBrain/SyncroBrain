# 公版控制器台架：先仿真，再实机

> 软件闭环已是 `protocol-verified`。未实机前不要把具体品牌写进「已兼容」。  
> Kit 合同：[spec/controller-kits.md](../spec/controller-kits.md)。场景：[spec/scenes.md](../spec/scenes.md)。

按这个顺序做：**Console 模拟设备 → MQTT 模拟设备 → 买件组网 → 真 ESP32**。跳步买 220 V 电机没有意义。

## 1. 现在：用模拟设备跑通（不必买硬件）

本机 Fake TB（Gateway `:13200` + Console `:15180`）即可，MQTT 可关。

1. 打开 [http://127.0.0.1:15180](http://127.0.0.1:15180)，演示登录。
2. 总览点 **楼宇窗控**（或灌溉 / 鱼塘）**一键演示**，进入设备页。
3. 点 **上报一次遥测**：应看到 Kit 通道（窗：`position_pct` / `rain` / `temperature`；灌溉：`soil_pct`；鱼塘：`do_mgl`）。
4. 点 Pack 仿真按钮（高温开缝 / 土壤过干 / 低溶氧 / **降雨关窗**）：告警页出现对应类型，**策略场景会自动评估并下发**（下雨 → `close`）。
5. 侧栏 **公版控制器** 可再手动评估：
   - 目录里有 `kit-win-act` 等 8 个 Kit。
   - `win-rain-close` → `dispatch · close`；下雨时 `win-manual` → `deny · INTERLOCK`。
   - 灌溉：干土 `zoneOn`，雨天手动开阀 `INTERLOCK`。
   - 鱼塘：低氧 `aeratorOn`，低水位手动喷水 `INTERLOCK`。

边缘无 UI 的 Scene Kernel：

```bash
node iot-edge-agent/sim/esp32-kit-sim.mjs
pnpm --dir iot-edge-agent test
```

通过即协议层成立。后面买硬件只是把同一组 key / RPC 换成真 GPIO。

## 2. 可选：真 ThingsBoard 上的 MQTT 模拟设备

compose 起 TB（MQTT `:1883`）后，设备页复制命令或：

```bash
pnpm --dir iot-gateway mqtt:sim -- --profile smart-window --asset-id <uuid> --once
# 保持在线并应答 RPC（开/关/开度/阀/增氧）：
pnpm --dir iot-gateway mqtt:sim -- --profile smart-window --asset-id <uuid>
```

`agri-irrigation` / `agri-pond` / `env-lab` 把 `--profile` 换成对应 slug。`--asset-id` 会向 Gateway 取设备 Token。这是 **假设备、真 MQTT 路径**，固件应发同样的 `v1/devices/me/telemetry` 与 RPC。

## 3. 再买硬件（第一周只做窗控台架）

不要锁品牌。两家都能买到即可。

| 件数 | 买什么 | 接到哪 |
|------|--------|--------|
| 2 | ESP32-C3 或 S3 开发板 | 窗机 + 环境节点 |
| 1 | 2 路光耦继电器（5 V 控） | `open` / `close` 触点 |
| 2 | 微动限位 | `limit_open` / `limit_close` |
| 1 | 雨滴数字模块 | `rain` |
| 1 | SHT30 或 DHT22 | `temperature` |
| 1 套 | 12 V 电源、面包板、杜邦线 | MCU 与执行器电源隔离 |
| 可选 | LED 或 12 V 推杆 | 第一周用灯模拟行程 |

**不要**第一周接 220 V 窗机/增氧机。限位没接好会烧电机。

第二周可共用 4 路继电器 + 12 V 电磁阀/潜水泵 + 土壤探头 + 浮球水位。溶氧仪贵，台架可用假数据上报 `do_mgl`，只把继电器和水位互锁做实机。

## 4. 组装（原则，不是某块板的丝印）

- MCU 5 V/3.3 V 与 12 V 执行器 **隔离**（光耦继电器或 H 桥）。
- 双限位：到位必须停 PWM/继电器，不能只靠云端。
- 雨量、限位用数字输入；行程用时间或电流估 `position_pct`（0–100）。
- 公版固件尚未发发行包：用 Arduino / ESP-IDF 实现 TB MQTT 即可（协议绑定同样有效）。

最小上报（窗机必选）：

```json
{
  "position_pct": 0,
  "limit_open": 0,
  "limit_close": 1,
  "gateway_online": 1,
  "rain": 0,
  "temperature": 24
}
```

下行 RPC `method` = 命令 id：`open` / `close` / `stop` / `setPosition`（`params.pct`）。

## 5. 组网

1. Console 选中资产 → 复制 MQTT（host `127.0.0.1:1883` 或现场 TB，username = 设备 Token，password 空）。
2. Topic 固定：`v1/devices/me/telemetry` 上行；订阅 `v1/devices/me/rpc/request/+`，应答 `v1/devices/me/rpc/response/{id}`。
3. 公版认领：序列号以 `SBK-` 开头。协议认领：上报 key 覆盖 Kit 必选通道。
4. Wi-Fi 与 TB 同一可达网段；现场无公网时用 `kit-gw-esp` 或 4G DTU，不要自造第二套 topic。

## 6. 实机测试清单（过了才算 hardware-verified）

- [ ] Token 连上后，设备页 5 分钟内为「在线」或「有遥测」
- [ ] 必选通道都有点，无 `unmapped`
- [ ] Console 认领成功，资产上出现 `kitSlug`
- [ ] 下雨时 `open` / `setPosition` 被拒（`INTERLOCK`），`close` 能下发
- [ ] 限位到位继电器释放
- [ ] 断云（拔网）时本地仍禁止雨天开窗（边缘 Scene Kernel / 固件互锁）
- [ ] 灌溉：无流量且泵开超过 `dryRunSec` 停泵；鱼塘：低水位禁 `sprayOn`

未打勾的型号不得出现在销售「已兼容」列。
