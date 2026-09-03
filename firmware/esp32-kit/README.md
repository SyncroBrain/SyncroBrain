# ESP32 Controller Kit 参考固件

Arduino 工程，面向 **ESP32-C3 DevKit** 与 **ESP32-S3 DevKitC-1**。生产 MQTT 使用 ThingsBoard 标准主题：

- 遥测：`v1/devices/me/telemetry`
- RPC：`v1/devices/me/rpc/request/+` / `v1/devices/me/rpc/response/{id}`

## 配置

1. 复制 `secrets.example.h` → `secrets.h`（不要提交 Token / Wi-Fi）。
2. 在 `kit_config.h` 设置 `KIT_SLUG`：`kit-win-act` / `kit-valve-8z` / `kit-pond-ctrl` / `kit-env-node`。
3. 板卡：Arduino IDE 选择 ESP32C3 Dev Module 或 ESP32S3 Dev Module。
4. GPIO 9 低电平 = 本地 kill switch，立即 `stop`。

## 安全边界

雨天禁开、灌溉干转、鱼塘低水位禁喷由 **SyncroBrain Scene Kernel** 执行，固件只做限位、`MAX_ON_MS` 与本地急停。积木程序不能绕过云侧互锁。

## 验收

本目录是参考实现。在完成实机 MQTT 上报与 RPC 之前，兼容矩阵不得标 `hardware-verified`。
