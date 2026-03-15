# Release Notes

该目录用于存放 GitHub Release 说明文件，文件名必须与 tag 完全一致。
This directory stores GitHub release note files, and each filename must exactly match the release tag.

## File Naming

- `release-notes/v1.2.3.md`
- `release-notes/v1.2.3-extension.md`

## Writing Rules

- 仅在会触发 GitHub Release 的版本中强制要求提供该文件，也就是包含插件发布的 tag。
- 内容必须中英双语，简洁明了，通常控制在 2 到 5 条。
- 如果 tag 包含插件发布，必须明确列出本次插件更新内容。
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
