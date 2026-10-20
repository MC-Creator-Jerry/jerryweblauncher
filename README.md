# Jerry 网站启动台 (jerryweblauncher)

一键直达 Jerry 的全部网站。纯静态站点，无依赖、无后端。

- 磁贴网格 + 实时搜索（`/` 聚焦）+ 分类筛选
- 快捷键：`/` 搜索 · `1`–`7` 直达 · `Esc` 清空
- 深浅主题（跟随系统，可手动切换并记忆）
- 实时时钟
- 横屏 / 竖屏 / 平板 / 折叠屏（左右双视窗、书本姿态）全适配，含安全区

## 文件

| 文件 | 说明 |
|---|---|
| `index.html` | 页面结构 |
| `style.css` | 样式（双主题 + 全设备适配） |
| `app.js` | 渲染 / 搜索 / 筛选 / 快捷键 / 时钟 / 主题 |
| `favicon.svg` | 图标 |

## 新增网站

编辑 `app.js` 顶部的 `SITES` 数组，每条包含 `name / desc / url / domain / icon / cat / keys`。

## 本地预览

直接用浏览器打开 `index.html`，或：

```bash
npx wrangler pages dev .
```

## 部署

```bash
wrangler pages deploy . --project-name jerryweblauncher --branch main
```

线上：<https://jerryweblauncher.pages.dev>
