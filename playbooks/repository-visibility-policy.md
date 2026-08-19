# SyncroBrain 仓库可见性策略

> 对齐 LuminaryWorks 产品仓惯例：对外 docs 公开，核心代码私有。勿再把已废止的 VibeEdu 仓库路径当作权威。

## 原则

| 类型 | 可见性 | 原因 |
|------|--------|------|
| **docs**（RsPress 文档站） | **Public** | 降低接入与试点沟通成本；SEO |
| MetaRepo（platform：spec/plan/contracts） | **Private** | 工程治理、未发布路线图与商业规格 |
| iot-gateway / iot-console-web | **Private** | Pack、交付编排与产品入口；许可见 [spec/licensing.md](../spec/licensing.md) |
| website | **Private** | 品牌站点与部署密钥（Cloudflare） |
| deploy | **Private** | 含默认密钥模板与内网拓扑 |
| app-mobile | **不建**（首年 PWA） | 原生 App 非 MVP |

GitHub 组织首页的 MetaRepo 链接若显示为 Public，以本表为准：**platform 为 Private**。profile README 不得把私有仓写成 Public。

## 开源节奏

1. **现在**：公开 `syncrobrain/docs`。contracts 随私有 MetaRepo 维护，需要对外对接时再抽取发布。核心代码保持私有。
2. **Showcase 后**：评估是否公开安装说明与 compose 示例。
3. **iot-gateway 是否改为 Apache-2.0**：仅在 [spec/licensing.md](../spec/licensing.md) 评估通过后；默认不开核心编排。
4. ThingsBoard CE 遵循 Apache-2.0，**不混授**成 SyncroBrain 许可；Build 默认交付 TB CE 镜像并保留 NOTICE。EMQX 仅启用时列入。

禁止对外写「核心平台已 Apache/MIT」——根目录 [LICENSE](../LICENSE) 为 Polyform-NC。

## 新人权限

- 公开 docs：任何人可阅读快速开始
- 私有仓：组织成员 + CI bot；外包仅授予对应子仓

## 拆解关联

见 [plan/repository-split.md](../plan/repository-split.md)。
