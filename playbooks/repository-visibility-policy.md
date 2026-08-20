# SyncroBrain 仓库可见性策略

> 对齐 LuminaryWorks 产品仓惯例，但 **2026-08 起暂不挂公开 docs 站点**（产品偏薄，先迭代）。

## 原则

| 类型 | 可见性 | 原因 |
|------|--------|------|
| **docs**（RsPress） | **暂不公开发布 / 不挂站** | 本地草稿可改；产品够厚后再评估公开 |
| MetaRepo（platform：spec/plan/contracts） | **Private** | 工程治理、未发布路线图与商业规格 |
| iot-gateway / iot-console-web | **Private** | Pack、交付编排与产品入口；许可见 [spec/licensing.md](../spec/licensing.md) |
| website | **Private** | 品牌站点与部署密钥（Cloudflare） |
| deploy | **Private** | 含默认密钥模板与内网拓扑；**权威安装说明** |
| app-mobile | **不建**（首年 PWA） | 原生 App 非 MVP |

GitHub 组织首页的 MetaRepo 链接若显示为 Public，以本表为准：**platform 为 Private**。profile README 不得把私有仓写成 Public。

## 开源节奏

1. **现在**：核心代码私有；安装跟 `deploy/INSTALL.md`；docs 草稿不对外当产品发布。
2. **Product Iterate 达标后**：评估是否公开安装说明与 compose 示例。
3. **iot-gateway 是否改为 Apache-2.0**：仅在 [spec/licensing.md](../spec/licensing.md) 评估通过后；默认不开核心编排。
4. ThingsBoard CE 遵循 Apache-2.0，**不混授**成 SyncroBrain 许可；交付 TB CE 镜像并保留 NOTICE。EMQX 仅启用时列入。

禁止对外写「核心平台已 Apache/MIT」——根目录 [LICENSE](../LICENSE) 为 Polyform-NC。

## 新人权限

- 安装与演示：组织成员按 `deploy/` + 内部演示脚本
- 私有仓：组织成员 + CI bot；外包仅授予对应子仓

## 拆解关联

见 [plan/repository-split.md](../plan/repository-split.md) · 当前阶段 [plan/product-iterate.md](../plan/product-iterate.md)。
