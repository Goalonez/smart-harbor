# Changelog

本文件用于在 `main` 分支记录每个正式版本的简洁更新说明。
Each release on `main` should add a short bilingual summary here.

## v1.2.3-web - 2026-03-23

### 中文
- 新增独立的探测设置，可分别配置内外网健康检查地址，系统会自动补全固定的 `/api/health` 路径。
- 自动网络判断优先使用全局健康地址，未完整配置时会回退到首个书签的探测逻辑，顶部网络说明也同步更新。
- 新增和编辑书签时不再需要填写探测地址，书签配置项更精简。
- 中文书签名现在会自动生成更稳定的拼音标识，减少手动补 slug 的麻烦。

### English
- Added a dedicated probe settings section so LAN and WAN health check addresses can be configured separately, with the fixed `/api/health` path appended automatically.
- Automatic network detection now prefers the global health check addresses and falls back to the first bookmark probe when the probe setup is incomplete, with the top-bar help updated accordingly.
- Removed the probe URL field from bookmark creation and editing to keep bookmark configuration simpler.
- Chinese bookmark names now generate more stable pinyin slugs automatically, reducing the need to fill slugs manually.

## v1.2.2 - 2026-03-15

### 中文
- 优化首页书签卡片布局，桌面端会根据可用宽度更自然地保持单行排列。
- 改进较长书签名称的显示效果，减少拥挤和换行异常。
- 优化顶部网络模式说明弹层的桌面端显示，减少多余滚动并提升可读性。

### English
- Improved the homepage bookmark grid so desktop layouts keep single-row groups more naturally based on available width.
- Improved long bookmark name rendering to reduce cramped wrapping and overflow issues.
- Improved the desktop network mode help popover to reduce unnecessary scrolling and make it easier to read.

## Writing Rules

- 新版本写在最上方，按版本倒序排列。
- 每个版本同时提供中文和英文说明。
- 内容保持简洁，优先列出 2 到 5 条用户可感知的更新。
- 避免长段落、实现细节和空泛描述。
- 如果本次版本包含插件发布，应明确写出插件相关更新。

## Template

```md
## vX.Y.Z[-web|-extension] - YYYY-MM-DD

### 中文
- 更新点 1
- 更新点 2
- 插件：更新点 3

### English
- Update 1
- Update 2
- Extension: Update 3
```
