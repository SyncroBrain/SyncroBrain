# 草案：ColdGuard 遥测信封

> **不是已发布合同。** 实现可按此收敛；接入现网 `iot/v1/{deviceId}/telemetry` 时须适配进该信封，缺外键则 `quality=unmapped` 入死信。  
> 权威字段表：[spec/device-domain.md](../../spec/device-domain.md)  
> 目标 topic：[spec/architecture.md](../../spec/architecture.md) `coldguard/v1/{tenantId}/{siteId}/{assetId}/telemetry`

## JSON 例（temperature）

```json
{
  "tenantId": "00000000-0000-0000-0000-000000000001",
  "siteId": "00000000-0000-0000-0000-000000000002",
  "assetId": "00000000-0000-0000-0000-000000000003",
  "channelId": "00000000-0000-0000-0000-000000000004",
  "schemaVersion": "cold-lab/0.1-draft",
  "type": "temperature",
  "value": 4.2,
  "unit": "Cel",
  "eventTime": "2026-08-17T14:00:00.000Z",
  "ingestedAt": "2026-08-17T14:00:03.000Z",
  "quality": "ok",
  "idempotencyKey": "gw-01:4:2026-08-17T14:00:00.000Z"
}
```

`quality` 枚举：`ok` | `late` | `out_of_order` | `clock_skew` | `backfill` | `unmapped`。

`type` 与 Pack 对齐：`temperature` | `door` | `power` | `gateway_online`。  
`door` / `power` / `gateway_online` 的 `value` 用 `0` / `1`，`unit` 为 `1`。

## 目标 MQTT topic

```text
coldguard/v1/{tenantId}/{siteId}/{assetId}/telemetry
```

Payload 仍为单条信封 JSON。网关可批量，但每条必须能独立幂等。

## 与 v0.1 Device 的关系

`device.v1` 的 `id` 在 Wedge 映射为 `gateway` Asset 或遗留 Device。新代码路径禁止只认 ThingsBoard device token 为主键。
