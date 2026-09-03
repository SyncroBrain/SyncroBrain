# Controller Kit 机器可读目录

产品说明：[controller-kits.md](../controller-kits.md)。Schema：[controller-kit.schema.json](../../contracts/schemas/controller-kit.schema.json)。

| 文件 | slug | 用途 |
|------|------|------|
| `kit-win-act.json` | 窗控/通风口 | 电动推杆、遮阳、温室顶窗 |
| `kit-rly-4ch.json` | 四路开关 | 浇水、喷淋、增氧、除霜、灯 |
| `kit-valve-8z.json` | 分区阀 | 灌溉、补水 |
| `kit-pond-ctrl.json` | 鱼塘 | 增氧、喷水降温 |
| `kit-env-node.json` | 环境传感 | 温湿度、土壤、雨量、光照 |
| `kit-cold-trk.json` | 冷链箱体 | 温度、门、GPS、冲击 |
| `kit-fan-pwm.json` | 风机 | 温室/冷库/充电棚通风 |
| `kit-gw-esp.json` | ESP32 现场网关 | 低成本汇聚；多协议仍用 EdgeAgent |

边缘加载：`iot-edge-agent/src/kits/catalog.mjs`。
