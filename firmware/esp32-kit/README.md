# ESP32 Controller Kit 参考固件

Arduino sketch，面向 **ESP32-C3 DevKit** 与 **ESP32-S3 DevKitC-1**。

这是参考实现，**不是**生产 SKU，**不是**二进制发行包。完成实机 MQTT 上报与 RPC 之前，兼容矩阵不得标 `hardware-verified`。

## ThingsBoard MQTT

生产主题（与 Cloud Lite 相同，不要自造第二套 topic）：

- 遥测：`v1/devices/me/telemetry`
- RPC 请求：`v1/devices/me/rpc/request/+`
- RPC 应答：`v1/devices/me/rpc/response/{id}`

## KIT_SLUG

在 `kit_config.h` 设置其一：

| `KIT_SLUG` | 用途 |
|------------|------|
| `kit-win-act` | 窗控执行器 |
| `kit-valve-8z` | 灌溉阀 |
| `kit-pond-ctrl` | 鱼塘增氧/喷水 |
| `kit-env-node` | 环境节点 |
| `kit-rly-4ch` | 4 路继电器 |
| `kit-fan-pwm` | PWM 风机 |
| `kit-gw-esp` | ESP 网关节点 |
| `kit-cold-trk` | 冷链跟踪 |

## 配置

1. 复制 `secrets.example.h` → `secrets.h`（不要提交 Token / Wi-Fi）。
2. 板卡：Arduino IDE 选择 ESP32C3 Dev Module 或 ESP32S3 Dev Module。
3. GPIO 9 低电平 = 本地 kill switch，立即 `stop`。

## 参考包（源码归档）

打参考源码包（**不含** `secrets.h`，**不是** hardware-verified 二进制）：

```bash
./pack-reference.sh
```

产物写到 `dist/`（仓库根 `.gitignore` 已忽略 `dist/`）。归档含 `esp32-kit.ino`、`kit_config.h`、`secrets.example.h`、本 README。脚本会打印归档的 SHA256。

## 安全边界

雨天禁开、灌溉干转、鱼塘低水位禁喷由 **SyncroBrain Scene Kernel** 执行，固件只做限位、`MAX_ON_MS` 与本地急停。积木程序不能绕过云侧互锁。
