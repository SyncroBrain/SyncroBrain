# 陪装 checklist（客户机）

> First Revenue · 陪装一次用。装完勾满再离开。  
> 权威步骤：[../deploy/INSTALL.md](../deploy/INSTALL.md) · 安全：[../deploy/SECURITY.md](../deploy/SECURITY.md)

## 1. 机前

- [ ] Docker Engine + Compose v2  
- [ ] 端口空闲：`19080` `1883` `5438` `13200` `15180`  
- [ ] 已取得 MetaRepo（含 `iot-gateway` / `iot-console-web` / `deploy`）  
- [ ] 交接包或 inventory JSON 已保存  

## 2. 启动

```bash
cd deploy
docker compose -f docker-compose.dev.yml up -d --build
./scripts/health-check.sh
```

- [ ] health-check 通过（TB 首次可多等 1–2 分钟）  
- [ ] Console http://127.0.0.1:15180 可打开  

## 3. 安全红线（当场做）

- [ ] ThingsBoard sysadmin **改密**，并同步 Gateway `TB_PASSWORD`  
- [ ] Postgres 默认口令已改（或确认不对公网暴露 `:5438`）  
- [ ] `CASBIN_DEV_OPEN=false`（试点 / 生产）  
- [ ] `JWT_SECRET` 已换（或已接客户 IdP）  
- [ ] 口头说明：Header「安全 N」含义  

## 4. 验收（按 demo-script 黄金路径）

- [ ] cold-lab 一键 → 模拟遥测有数  
- [ ] 演示告警 → 确认 → CSV  
- [ ] （可选）env-lab 口头或实机  
- [ ] 设置 → 导出版本清单或试点交接包  

## 5. 离开前

- [ ] 备份演练：`./scripts/backup.sh`（或约定下次）  
- [ ] 对方有 INSTALL / SECURITY / 交接包副本  
- [ ] 下一步：报价邮件（许可 / 部署 / 年支持），范围不含 EMQX/K8s/无限定制  

**陪装人：** ________　**日期：** ________　**站点：** ________
