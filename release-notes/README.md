# Release Notes

该目录用于存放 GitHub Release 说明文件，文件名必须与 tag 完全一致。
This directory stores GitHub release note files, and each filename must exactly match the release tag.

## File Naming

- `release-notes/v1.2.3.md`
- `release-notes/v1.2.3-web.md`
- `release-notes/v1.2.3-extension.md`

## Writing Rules

- 所有正式 tag 都必须提供该文件，包括 `vX.Y.Z`、`vX.Y.Z-web` 和 `vX.Y.Z-extension`。
- 内容必须中英双语，简洁明了，通常控制在 2 到 5 条。
- 如果 tag 包含插件发布，必须明确列出本次插件更新内容。
- 如果 tag 不包含插件发布，工作流会在 GitHub Release 末尾自动补充“去哪里下载最新插件”的说明，不需要手工重复写。
- 允许复用 `CHANGELOG.md` 的要点，但应整理为适合 GitHub Release 展示的简短说明。

## Template

```md
## 中文
- 更新点 1
- 更新点 2
- 插件：更新点 3

## English
- Update 1
- Update 2
- Extension: Update 3
```
