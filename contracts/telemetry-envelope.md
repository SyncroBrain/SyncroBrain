# Telemetry envelope（已发布）

> **状态**：**published** · `schemaVersion` = `telemetry-envelope/1.0`  
> JSON Schema：[schemas/telemetry-envelope.schema.json](./schemas/telemetry-envelope.schema.json)  
> 样例：[examples/telemetry-envelope.json](./examples/telemetry-envelope.json)  
> 领域表：[spec/device-domain.md](../spec/device-domain.md)

Pack / Gateway 内部规范化信封。设备生产路径仍走 ThingsBoard MQTT（`v1/devices/me/telemetry`）扁平 key；网关适配层将信封与 TB 扁平 key + `*_quality` 同伴键互转。跨产品总线是 CloudEvents，不是本信封。

## JSON 例（temperature）

```json
{
  "tenantId": "00000000-0000-0000-0000-000000000001",
  "siteId": "00000000-0000-0000-0000-000000000002",
  "assetId": "00000000-0000-0000-0000-000000000003",
  "channelId": "00000000-0000-0000-0000-000000000004",
  "schemaVersion": "telemetry-envelope/1.0",
  "type": "temperature",
  "value": 4.2,
  "unit": "Cel",
  "eventTime": "2026-08-17T14:00:00.000Z",
  "ingestedAt": "2026-08-17T14:00:03.000Z",
  "quality": "ok",
  "idempotencyKey": "gw-01:4:2026-08-17T14:00:00.000Z"
}
```

## `quality` 枚举（权威）

`ok` | `late` | `out_of_order` | `clock_skew` | `backfill` | `unmapped` | `buffer_overflow`

与告警映射质量（Console 告警筛选项 `ok` | `unmapped`）**不同**，禁止混用同一过滤器语义。

缺外键（tenant / site / asset / channel）时标记 `quality=unmapped` 入死信，禁止静默丢。断网补传必须 `backfill`；边缘环形缓存满载事件必须 `buffer_overflow`。

## 可选 `type`

Pack 通道 key（如 `temperature` | `door` | `power` | `gateway_online`）。写 TB 时作为扁平 value key；`door` / `power` / `gateway_online` 的 `value` 用 `0` / `1`，`unit` 为 `1`。

## 与 ThingsBoard 扁平存储

TB 仍为时序权威。网关写入时保留 value key，并附同伴字符串键：

| 信封 | TB keys |
|------|---------|
| `type=temperature`, `value=4.2`, `quality=ok` | `temperature=4.2` · `temperature_quality=ok` |

读回时若存在 `*_quality`，Gateway 在点对象上附加可选 `quality`，不破坏只读 `ts` / `value` 的调用方。

## 目标 MQTT topic（Pack 规范化，非设备强制第二协议）

```text
coldguard/v1/{tenantId}/{siteId}/{assetId}/telemetry
```

Payload 为单条信封 JSON。网关可批量，但每条必须能独立幂等。

## 与 v0.1 Device 的关系

`device.v1` 的 `id` 在 Wedge 映射为 `gateway` Asset 或遗留 Device。新代码路径禁止只认 ThingsBoard device token 为主键。
