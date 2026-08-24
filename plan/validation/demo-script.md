# 10 分钟 Cloud Lite 演示脚本（闭门 · 收紧版）

> **权威旁白**（内部 / 熟人技术买方）。公开 docs 站**不做**。  
> 阶段：Product Iterate 出门 → First Revenue 触达。  
> 安装：[../../deploy/INSTALL.md](../../deploy/INSTALL.md) · 运维：[../../deploy/OPS.md](../../deploy/OPS.md) · 许可：[../../spec/licensing.md](../../spec/licensing.md)

**原则：** 只走 Console 主路径；TB UI 最多一闪；不讲链上 / 生态宫格 / AI / EMQX。  
**成片：** 可选。录像时 1080p：终端 + Console（:15180）；TB UI 仅可选第三窗。

---

## 黄金路径（必走 · 约 10 分钟）

| 节拍 | 时间 | 动作 | 一句旁白 |
|------|------|------|----------|
| 开场 | 0:00–0:30 | 不操作 | 「Cloud Lite：设备运行时是 ThingsBoard CE（Apache-2.0）；项目、Pack、许可与交付是 SyncroBrain（Polyform-NC）。今天看底座，不是垂直冷链产品。」 |
| 入口 | 0:30–1:30 | 打开 `:15180` → 演示/统一登录 → Header 绿标；看总览「闭门演示教练」 | 「Compose 拉起 PG + TB + Gateway + Console。对外入口是 Console，不是 TB 原生 UI。」 |
| Pack | 1:30–4:00 | 总览 → **冷藏实验室 · 一键演示** → 设备表出现 | 「`cold-lab` 是参考 Industry Pack。换 Pack 不换运行时。」 |
| 遥测 | 4:00–5:30 | 设备 → **上报一次遥测** → 看温度/门（状态变「在线」或「有遥测」） | 「一键走 TB MQTT Transport；不必切终端。mqtt:sim 只在对方要看设备侧接入时再跑。」 |
| 告警 | 5:30–7:00 | 告警 → **超温模拟** → **确认** | 「写入超阈遥测并开 CRITICAL；告警真源在 TB，我们做列表与确认。」 |
| 交付 | 7:00–8:30 | 导出 CSV；设置 → **试点交接包**或版本清单（可选一句安全横幅） | 「备份脚本与版本清单在交付包里。默认口令 / `CASBIN_DEV_OPEN` 试点前必须改。」 |
| 第二 Pack | 8:30–9:30 | 总览口头指 **环境机房**，或再点一键（有时间才跑） | 「`env-lab` 证明 Pack 可替换：温湿度点，同一 Gateway。」 |
| 收尾 | 9:30–10:00 | 停 | 「下一步是闭门试点与报价，不是公开文档站，也不是再加 Broker。」 |

---

## 0. 走之前（演示日上午 · ≤5 分钟）

在 **MetaRepo** 的 `deploy/`：

```bash
docker compose -f docker-compose.dev.yml up -d --build
chmod +x scripts/*.sh
./scripts/health-check.sh
# 期望：Gateway / TB / Console 通过；thingsboard=up
```

| 项 | 值 |
|----|-----|
| Console | http://127.0.0.1:15180/login |
| Gateway | http://127.0.0.1:13200/api/v1/health |
| TB UI（备用） | http://127.0.0.1:19080 · 出厂 sysadmin **已改密则用演示账号** |
| 终端 cwd | `iot-gateway/`（模拟器用） |

**演示机红线（口头一句即可，勿展开）：** 默认 TB / PG 口令、`CASBIN_DEV_OPEN=true` 仅开发；给客户机前关掉。

若 Header 已有「安全 N」：点掉或说「开发机提醒，试点清单里会清」。

---

## 1. 开场（0:00–0:30）

**说：**

> 这是 SyncroBrain Cloud Lite。设备运行时是 ThingsBoard CE（Apache-2.0）；项目、Pack、许可与交付层是我们自己的（Polyform-NC）。目标：当场看清设备—遥测—规则—告警底座；私有化按交付包装，不是无限免费定制。

**不说：** 生态宫格、链上、AI Agent、多垂直同时上线、完整计费、EMQX、K8s、原生 App、「我们自研的设备引擎」（不披露 TB）。

---

## 2. 产品入口（0:30–1:30）

1. 打开 Console → **演示登录**（或已配 Logto 的统一登录）。  
2. 看 Header：**Gateway 在线** · **ThingsBoard up**。  
3. （可选，≤15 秒）另开 TB UI：「运维可进原生 UI；对外品牌入口是 Console。」

**说：**「价值讲清不依赖先打开 TB。」

---

## 3. Pack 一键（1:30–4:00）

1. **总览 → Industry Pack** 卡片看一眼：通道、正常窗、告警说明（来自 manifest）。  
2. 点 **冷藏实验室** 的 **一键演示**（勿先点项目向导，除非对方要改名）。  
3. 成功横幅出现后进 **设备**：选中新 `fridge-…`。  
4. （可选）打开 **详情**：指标卡对照阈值（正常 / 注意 / 超阈）。

**说：**「`cold-lab/0.1-draft` = Device Profile + Rule Chain + 默认阈值。垂直客户以后换 Pack，不换运行时。」

**卡顿：** Header 非绿 → 先 `./scripts/health-check.sh`，勿现场修库。一键失败 → 刷新一次；仍失败则改用附录 API，勿现场 debug TypeORM。

---

## 4. 遥测（4:00–5:30）

1. 设备页点选当前设备 → **上报一次遥测**（总览演示教练也可点）。  
2. 列表出现温度；cold-lab 可见门；env-lab 可见湿度。状态列变绿 **在线**（近 5 分钟有上报）。  
3. （可选）点 **持续上报**：约每 10 秒走步温度，总览趋势图会动。Header 蓝标可停。  
4. （可选）设备详情把 **设定温度** 改到 6°C 再走步：温度绕 6°C，证明共享属性已生效（不是设备 RPC）。  
4. （可选，对方是开发时）复制模拟器命令，在 `iot-gateway` 再跑一次，证明设备侧 MQTT：

```bash
pnpm mqtt:sim -- --asset-id <uuid> --once
# env-lab：
pnpm mqtt:sim -- --profile env-lab --asset-id <uuid> --once
```

**说：**「凭证是 TB Device token。Console 一键与模拟器走同一 MQTT topic；Gateway 管项目映射，不另起采集协议。」

---

## 5. 告警闭环（5:30–7:00）

1. 保持当前设备选中 → **告警** → **超温模拟**（写入超阈遥测 + 开 CRITICAL；不必切终端）。  
2. 表中出现 CRITICAL / Temperature High → **确认**（可填备注；Webhook 会带上）。  
3. 看 Webhook 列：未配置则 skipped；已配 `ALARM_WEBHOOK_URL` 则提一句「可打到企微/钉钉」。  
4. （可选）**恢复正常窗** 把遥测拉回阈值内，再 **清除** 告警。  
5. （备用）「仅开告警单」只注入 TB Alarm，不改遥测。

**说：**「告警真源在 ThingsBoard；我们做列表、确认、导出与通知编排。超温模拟优先走 TB MQTT 写时序；演示不等 Pack 持续 180s。」

---

## 6. 导出与交付叙事（7:00–8:30）

1. **导出 CSV**（告警或遥测任一即可，优先告警）。  
2. **设置 → 导出版本清单**（JSON）：「试点交接用，含 Pack 与安全警告码。」  
3. 许可口径一句：商业许可 / 年支持 / Pack 升级走 SyncroBrain；TB 保留 NOTICE。

**不说：** 已接 Entitlement 计费、白牌等于去掉 TB 归属。

---

## 7. 第二 Pack（8:30–9:30）

**时间紧：** 总览指着 **环境机房** 卡片：「同一 Console，温湿度通道；证明可替换。」

**有余量：** 再点 env-lab **一键演示** → 设备见 `room-…` → 复制带 `--profile env-lab` 的模拟命令 → 刷湿度。

---

## 8. 收尾（9:30–10:00）

**说：**

> 今天看到的是可私有化演示的 Cloud Lite：compose、双 Pack、模拟器、告警 Ack、CSV、版本清单。我们在收紧体验给闭门试点；下一步是安装包 + 报价，不是公开文档站，也不是再加一套 Broker。

**递出（可选）：** `deploy/INSTALL.md` + 当场导出的 inventory JSON。  
**不问：** 「你们预算多少」作为第一句；可问「是否方便下周装一台内网机走同一脚本」。

---

## 禁止承诺（贴显示器边）

| 勿承诺 | 可说 |
|--------|------|
| EMQX / Kafka / K8s | Compose 单体 Cloud Lite |
| 原生 App / 大屏定制无限改 | Console + TB 运维 UI |
| 完整商业计费已上线 | 离线许可占位；合同前谈年支持 |
| 公开 docs / 自助安装社区版 | 私有安装说明 + 陪装 |
| 冷链合规审计产品已交付 | cold-lab 是参考 Pack，阈值待验证 |

实验室冷藏深聊 → 另开 [gap-diagnosis.md](../../playbooks/gap-diagnosis.md)，**不占本 10 分钟**。

---

## 故障快修（现场）

| 现象 | 动作 |
|------|------|
| Gateway / TB 红 | `deploy/scripts/health-check.sh`；等 TB start_period；勿改库 |
| 一键演示失败 | 刷新；确认 `:13200` 未被宿主机 `pnpm dev` 抢端口 |
| 模拟无温度 | 先点「上报一次遥测」；仍无则检查 MQTT_URL / 选中设备 |
| 告警按钮灰 | 先在设备表点选一行 |
| 登录失败 | 演示登录；或确认 Logto `pnpm id:up`（非本脚本重点） |

---

## 自检（演示前勾一次 · 演示后再勾）

- [ ] `./scripts/health-check.sh` 全绿（或已知 TB 仍在启动中）  
- [ ] cold-lab 一键 → 遥测有数 → 告警 Ack → CSV  
- [ ] 口头或实机提到 env-lab  
- [ ] 口播区分 TB Apache-2.0 vs 自研 Polyform-NC  
- [ ] 未承诺 EMQX / K8s / 原生 App / 完整计费 / 公开 docs  
- [ ] （可选）版本清单 JSON 已导出  

**连续 3 次无手工修库** 才算 Product Iterate「演示稳定」出门标准。

---

## 附录 A — API 备用路径（观众是开发时才用）

```bash
TOKEN=$(curl -s -X POST http://127.0.0.1:13200/api/v1/auth/demo | jq -r .accessToken)
curl -s -X POST http://127.0.0.1:13200/api/v1/demos/cold-lab \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"projectName":"Demo Lab"}'
```

主路径仍应回到 Console 指设备与告警，避免变成 curl 秀。

## 附录 B — 本地 docs 草稿

`docs/docs/guide/demo.md` 是摘要镜像；**以本文件为准**。不挂公开站点。
