# Changelog

本文件用于在 `main` 分支记录每个正式版本的简洁更新说明。
Each release on `main` should add a short bilingual summary here.

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
