# 白牌客户样例（env 片段）

> 仅改 Console 壳文案 / Logo / 主题色。  
> **禁止**隐藏 ThingsBoard 归属（保持 `BRAND_HIDE_TB_CREDIT` 非 true，或 footer 仍披露 CE）。  
> API：`GET /api/v1/branding`

## Gateway `.env` 片段

```bash
BRAND_PRODUCT_NAME=Acme 现场监控
BRAND_PRODUCT_SHORT=Acme IoT
BRAND_TAGLINE=私有化设备控制台
BRAND_EDITION=Cloud Lite
BRAND_THEME_COLOR=#0B6E4F
# BRAND_LOGO_URL=https://cdn.example.com/acme-logo.svg
BRAND_FOOTER_NOTE=设备运行时是 ThingsBoard CE（Apache-2.0）。编排与 Console 由交付方提供。
# BRAND_HIDE_TB_CREDIT=false
```

Compose 覆盖示例（`deploy/docker-compose.dev.yml` 的 `iot-gateway.environment`）：

```yaml
BRAND_PRODUCT_NAME: Acme 现场监控
BRAND_TAGLINE: 私有化设备控制台
BRAND_THEME_COLOR: "#0B6E4F"
```

改完重启 Gateway，刷 Console 登录页与侧栏。

## 验收

- [ ] 登录页 / 侧栏显示客户名  
- [ ] 主题色生效  
- [ ] 口播仍说明 TB CE 为设备引擎  
