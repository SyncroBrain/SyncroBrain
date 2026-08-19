# 10 分钟 Cloud Lite 演示脚本（Build · 录像文字版）

> 对象：集成商 / 企业 IT。禁止先讲链上、生态宫格。  
> 权威概要：[../build.md](../build.md) §5 · 运维：[../../deploy/OPS.md](../../deploy/OPS.md)

录屏建议：1080p，终端 + Console + TB UI 三窗口；旁白用下文「说」。

## 0. 前置（录屏前 5 分钟，不入镜）

| 项 | 命令 / 值 |
|----|-----------|
| Compose | `cd deploy && docker compose -f docker-compose.dev.yml up -d --build`（PG + TB + Gateway + Console） |
| Gateway | `cd iot-gateway && pnpm dev` → `:13200` |
| Console | `cd iot-console-web && pnpm dev` → `:5180` |
| TB UI | `http://127.0.0.1:8080` · 默认 `sysadmin@thingsboard.org` / `sysadmin`（演示机已改密则用演示账号） |
| 健康 | `curl -s http://127.0.0.1:13200/api/v1/health` 含 `thingsboard: ok` |

## 1. 开场承诺（0:00–0:30）

**说：**「这是 SyncroBrain Cloud Lite。设备运行时是 ThingsBoard CE（Apache-2.0）；项目、Pack、许可与交付层是我们自己的（Polyform-NC）。目标：30 分钟起演示，7 天内可私有化交付——设备、遥测、规则、告警底座。」

**不说：**生态宫格、链上、AI、多垂直同时上线。

## 2. Compose + 产品入口（0:30–2:30）

1. 浏览器打开 Console `http://localhost:5180`，演示登录。  
2. 点健康/状态区，确认 ThingsBoard 已连接。  
3. （可选）另开 TB UI `:8080`，说：「原生 UI 给运维；对外品牌入口是 SyncroBrain Console。」

**说：**「一键 compose 拉起 TB + Gateway PG；Gateway 与 Console 是宿主机进程，方便改代码。」

## 3. 一键演示 / Pack（2:30–5:30）

**路径 A（推荐录屏）— Console「一键演示」**

1. 点 **一键演示**（或项目向导），等待 Project → Pack → Site → Asset。  
2. 资产表出现 `fridge-…`，记下 MQTT token（或向导结果里的 token）。  
3. 终端跑模拟器：

```bash
cd iot-gateway
pnpm mqtt:sim -- --once --token '<MQTT_ACCESS_TOKEN>'
# 或环境变量 TB_DEVICE_TOKEN=...
```

4. Console 刷新，温度列出现数值。

**路径 B — API**

```bash
TOKEN=$(curl -s -X POST http://127.0.0.1:13200/api/v1/auth/demo | jq -r .accessToken)
curl -s -X POST http://127.0.0.1:13200/api/v1/demos/cold-lab \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"projectName":"Demo Lab"}'
```

**说：**「`cold-lab/0.1-draft` 是参考 Industry Pack：Device Profile + Rule Chain。垂直客户以后换 Pack，不换运行时。」

## 4. 告警闭环（5:30–7:30）

1. Console：**创建演示告警**（或 `POST /assets/:id/alarms`）。  
2. 告警表出现 `Temperature High` / CRITICAL。  
3. 点 **确认** → 状态变已确认；若配置了 `ALARM_WEBHOOK_URL`，提一句「可回调企业微信/钉钉」。  

**说：**「告警真源在 ThingsBoard Alarm；我们做列表、确认与通知编排，不做第二套规则引擎。」

## 5. 导出 + 许可叙事（7:30–9:30）

1. 点 **导出 CSV**（`GET /alarms/export.csv`）。  
2. （可选）打开 `deploy/OPS.md` 一页：备份脚本、版本清单。  

**说：**「运行时 TB CE 可审计；商业许可、年支持与 Pack 升级走 SyncroBrain。不是无限免费定制。」

若对方是实验室冷藏：再切 [gap-diagnosis.md](../../playbooks/gap-diagnosis.md)（Showcase 触达，不占 Build 出门条）。

## 6. 收尾（9:30–10:00）

**说：**「今天看到的是 Build 冻结范围：compose、Pack、模拟器、告警、CSV、备份说明。下一步是现场私有化试点与报价，不是再加 EMQX。」

## 检查清单（录完自检）

- [ ] Console 能列出映射资产与遥测  
- [ ] 告警可创建并 Ack  
- [ ] CSV 下载成功  
- [ ] 口播区分 TB Apache-2.0 vs 自研 Polyform-NC  
- [ ] 未承诺 EMQX / K8s / 原生 App / 完整计费  
