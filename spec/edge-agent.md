# EdgeAgent 与标准协议 (v1.0)

> 独立可部署进程，不把长连接塞进 Gateway REST。  
> 代码：`iot-edge-agent/`。合同：[contracts/schemas/edge-registration.schema.json](../contracts/schemas/edge-registration.schema.json)。

## 1. 职责

- 设备身份、TLS/mTLS、证书轮换
- 协议适配：OCPP 1.6J / 2.0.1、Modbus RTU/TCP、OPC UA、MQTT/HTTP GPS
- 本地环形缓存、时钟/质量标记、本地阈值、签名配置
- 命令执行与回执；离线时本地策略继续，上线后补传 `quality=backfill`

## 2. 与 Cloud Lite 的关系

```text
设备 ──协议──► EdgeAgent ──MQTT/REST──► ThingsBoard CE ──► Gateway
                     ▲                                      │
                     └──────── 命令回执 / 配置 ─────────────┘
```

Gateway 注册边缘节点（`POST /api/v1/edge/nodes`）。Edge 只持有站点范围凭据。

## 3. 验证等级

| 标记 | 含义 |
|------|------|
| `protocol-verified` | 官方/开源仿真器 + 录制回放通过 |
| `hardware-verified` | 指定品牌型号实机实验室通过 |

厂商方言只存在 Pack `adapters`。未列入兼容矩阵的型号不得出现在销售材料的「已兼容」列。
