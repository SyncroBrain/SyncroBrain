# 多芯片固件参考

乐鑫 Arduino 草图仍在 `esp32-kit/`。其它芯片共用 `kit-core/` 的通道、急停、雨天禁开、低水位禁喷和干转停泵。

| 目录 | 芯片 | 本机可测 | 上板还要 |
|------|------|----------|----------|
| `ports/beken` | BK7231N / BK7252 | `cc -DHOST_BUILD` | Beken SDK，`BK_SDK` |
| `ports/nordic` | nRF52840 | 同上 | nRF5 / Zephyr，`NRF_SDK` |
| `ports/stm32wl` | STM32WL55 | 同上 | STM32Cube，`STM32_HAL` |
| `ports/cat1` | 移远 EC800 类 AT | 同上 | 模组串口 |

```bash
./firmware/scripts/test-ports.sh
```

主题仍是 ThingsBoard `v1/devices/me/telemetry`。这些端口没有在实机上跑过，不能标 `hardware-verified`。

电路板参考：`hardware/templates/`。
