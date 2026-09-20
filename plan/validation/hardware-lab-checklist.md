# 实机实验室清单（软件门禁就绪 · 未标 hardware-verified）

> 对齐 [spec/iot-lab-acceptance.md](../../spec/iot-lab-acceptance.md) §7。  
> 本清单准备「插板即可测」路径；**全部行勾选并填写日期/执行人前**，兼容矩阵状态列保持 `protocol-verified`，品牌列不得写 `hardware-verified`。  
> 台架顺序见 [playbooks/controller-bench.md](../../playbooks/controller-bench.md)。参考固件：[firmware/esp32-kit](../../firmware/esp32-kit/)。

| 字段 | 值 |
|------|-----|
| 日期 | _YYYY-MM-DD_ |
| 执行人 | |
| 环境 | Fake TB / 真 TB MQTT：___ |
| 板卡批次 / 序列号 | |

## 0. 前置条件（软件侧，可先于硬件）

| 勾选 | 项 | 说明 |
|------|----|------|
| [ ] | 参考固件路径存在 | `firmware/esp32-kit/`（`esp32-kit.ino`、`kit_config.h`、`secrets.example.h`、README） |
| [ ] | Kit 仿真或文档就绪 | `iot-edge-agent/sim/esp32-kit-sim.mjs` 可跑，或 [controller-bench.md](../../playbooks/controller-bench.md) 可跟 |
| [ ] | Fake TB / Gateway | 本机或 compose：Gateway `:13200`；演示可用 `TB_MODE=fake` |
| [ ] | Console 认领路径 | Console `:15180`；公版认领（`SBK-`）或协议认领后资产出现 `kitSlug` |
| [ ] | 可选烟测脚本 | `./deploy/scripts/hardware-lab-smoke.sh`（**仅**校验软件前置，**不**升级矩阵） |

一键软件前置：

```bash
./deploy/scripts/hardware-lab-smoke.sh
```

脚本绿 **只** 表示仓库与文档就绪，**不等于** 实机通过，也 **不得** 改兼容矩阵。

## 1. 实机步骤（iot-lab-acceptance §7）

每行勾选时填写日期与执行人。任一行未勾 = 矩阵仍为 `protocol-verified`。

| 勾选 | 板卡 / 场景 | 验收要点 | 日期 | 执行人 |
|------|-------------|----------|------|--------|
| [ ] | ESP32-C3 DevKit | MQTT 遥测至少一次上报；RPC 至少一次应答（`open`/`close`/`stop` 或 Kit 等价命令） | | |
| [ ] | ESP32-S3 DevKitC-1 | 同上：MQTT 上报 + RPC 各至少一次 | | |
| [ ] | 窗控 · 雨关 + 限位 | 下雨时 `open`/`setPosition` 拒（`INTERLOCK`），`close` 可下发；限位到位继电器释放 | | |
| [ ] | 灌溉 · 12V 小泵 | 阀/泵可受控启停；干转保护路径可观测（无流量超阈停泵或等价） | | |
| [ ] | 鱼塘 · 12V 小泵 + 浮球 | 增氧/喷水可受控；低水位禁 `sprayOn`（浮球或等价水位输入） | | |

Topic 固定：`v1/devices/me/telemetry`；RPC `v1/devices/me/rpc/request/+` → `v1/devices/me/rpc/response/{id}`。固件配置见 `firmware/esp32-kit`（`KIT_SLUG`、`secrets.h`）。

## 2. 矩阵门禁（强制）

- 本清单未全部勾选（含日期与执行人）之前：**不得** 将 [compatibility-matrix.md](../../spec/compatibility-matrix.md) 状态列或品牌列标为 `hardware-verified`。
- 矩阵在实机完成前保持 **protocol-verified**；ESP32-C3 / S3 仅可出现在「待实机队列」。
- 可选 `hardware-lab-smoke.sh` 通过 **不能** 作为升级矩阵的证据。

## 3. 明确不宣称

勾选本清单部分行、或仅软件前置绿，**不能** 证明：

- 销售话术「已兼容某品牌型号」
- Multi-Vertical / 全硬件生产兼容
- 220 V 窗机 / 工业泵等未列入本表的负载

发布门：[spec/release-gates.md](../../spec/release-gates.md)。验收总表：[spec/iot-lab-acceptance.md](../../spec/iot-lab-acceptance.md)。
