# Smart Harbor

[English](README.md)

一个通过 vibe coding 实现的自托管智能书签导航页。自动识别内外网环境并切换对应地址。

## 功能特性

- 自动检测内网 / 外网环境，智能切换主备地址
- 可视化书签编辑器，支持拖拽排序、图标选择、JSON 编辑
- WebDAV 远端备份，支持定时自动备份与版本恢复
- 管理员认证，密码使用 scrypt 哈希存储
- 明暗主题与响应式布局
- 所有配置存储在单个 `config.json` 文件中，方便备份与迁移

## 快速部署

```bash
docker run -d \
  --name smart-harbor \
  -p 8080:80 \
  -v $(pwd)/config:/app/config \
  goalonez/smart-harbor:latest
```

打开 `http://localhost:8080`，首次访问会引导创建管理员账号。

所有配置保存在挂载的 `config/config.json` 中。

## 配置说明

首次启动会自动生成默认 `config.json`，主要字段：

| 字段 | 说明 |
|------|------|
| `system.appName` | 页面标题 |
| `system.darkMode` | 是否启用深色模式 |
| `system.defaultSearchEngine` | 默认搜索引擎 ID |
| `system.customSearchEngines` | 自定义搜索引擎列表 |
| `system.webdavBackup` | WebDAV 远端备份配置 |
| `services` | 书签分组与书签列表 |

<details>
<summary>config.json 示例</summary>

```json
{
  "system": {
    "appName": "Smart Harbor",
    "darkMode": false,
    "defaultSearchEngine": "google",
    "webdavBackup": {
      "url": "",
      "username": "",
      "password": "",
      "remotePath": "/smart-harbor",
      "autoBackup": false,
      "intervalDays": 7,
      "maxVersions": 10
    }
  },
  "services": [
    {
      "category": "示例分组",
      "items": [
        {
          "slug": "example",
          "name": "示例书签",
          "icon": "BookOpen",
          "primaryUrl": "https://example.com",
          "secondaryUrl": "https://example.com"
        }
      ]
    }
  ]
}
```

</details>

## 认证与重置

- 首次访问：当 `system.auth` 不存在时进入管理员初始化流程
- 重置密码：删除 `config.json` 中的 `system.auth` 后重新访问
- 安全策略：连续登录失败 5 次后锁定 30 分钟

## 本地开发

```bash
npm install
npm run dev
```

- 前端：`http://localhost:3000`
- 后端 API：`http://localhost:3001`

```bash
npm run build
npm run preview
```

## 技术栈

React 19 · TypeScript · Vite · Tailwind CSS · Zustand · TanStack Query · Fastify · Zod

## 许可证

[Apache-2.0](LICENSE)
