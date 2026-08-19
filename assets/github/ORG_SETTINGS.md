# GitHub 组织资料设置

组织：[github.com/syncrobrain](https://github.com/syncrobrain)

## 组织简介（Settings → Profile → Description）

粘贴到 GitHub Organization settings：

```text
Private IoT delivery on ThingsBoard CE. Packs, on-prem, commercial license. syncrobrain.com
```

## 组织头像

上传 `assets/github/org-avatar.png`（由 `node assets/github/render.mjs` 生成）。

## 组织主页 README

仓库 [`syncrobrain/.github`](https://github.com/syncrobrain/.github) 的 `profile/README.md` 会显示在组织首页。

源文件维护于本仓 `assets/github/profile/README.md`，发布脚本：

```bash
node assets/github/render.mjs
node tooling/scripts/publish-github-profile.mjs
```

## 封面图

| 文件 | 用途 |
|------|------|
| `profile/banner.png` | 组织 README 顶部横幅（1280×640） |
| `social-preview.png` | 链接分享预览（1200×630） |
