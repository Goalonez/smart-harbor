# Smart Harbor

[English](README.md)

Smart Harbor 是一个面向个人自托管服务的智能导航主页。

它能够自动检测当前的网络环境，并在局域网地址和公网地址之间智能切换，始终选择最合适的访问入口。

## 界面预览

### 首页

![Smart Harbor 首页](image/index.png)

### 设置面板

![Smart Harbor 设置面板](image/setting.png)

### 书签管理

![Smart Harbor 书签管理](image/bookmark.png)

### Chrome 新标签页插件

![Smart Harbor Chrome 插件](image/extension.png)

## 适合用来做什么

- 按网络环境自动切换书签的局域网和公网地址
- 拖拽整理分组书签，并支持图标展示
- 内置搜索框，支持自定义搜索引擎
- WebDAV 备份、恢复和版本保留
- 受密码保护的管理面板和登录锁定保护
- 可选的 Chrome 新标签页插件

## 快速部署

### Docker Compose

```yaml
services:
  smart-harbor:
    image: goalonez/smart-harbor:latest
    container_name: smart-harbor
    ports:
      - 8080:80
    volumes:
      - ./smart-harbor/config:/app/config
    restart: unless-stopped
```

### Docker Run

```bash
docker run -d \
  --name smart-harbor \
  -p 8080:80 \
  -v ./smart-harbor/config:/app/config \
  goalonez/smart-harbor:latest
```

启动后：

1. 打开 `http://localhost:8080`。
2. 首次访问时创建管理员账号。
3. 进入设置面板，开始添加分组和书签。

## 配置文件说明

首次启动后，Smart Harbor 会在挂载的配置目录中生成一个统一的 `config.json`。

- 宿主机示例路径：`./smart-harbor/config/config.json`
- 容器内路径：`/app/config/config.json`

### 常用字段

| 路径 | 作用 |
| --- | --- |
| `system.appName` | 页面标题和浏览器标签名称 |
| `system.darkMode` | 明暗主题切换 |
| `system.clickOpenTarget` | 单击打开书签和搜索结果的方式 |
| `system.middleClickOpenTarget` | 中键打开书签和搜索结果的方式 |
| `system.defaultSearchEngine` | 搜索框默认搜索引擎 |
| `system.webdavBackup` | WebDAV 备份地址、周期和保留策略 |
| `services[].category` | 分组名称 |
| `services[].items[]` | 每个分组下的书签列表 |

<details>
<summary>完整配置字段</summary>

#### `system`

| 路径 | 说明 | 备注 |
| --- | --- | --- |
| `system.appName` | 应用名称，显示在页面和浏览器标签中 | 默认 `Smart Harbor` |
| `system.darkMode` | 是否启用深色模式 | `true` 或 `false` |
| `system.clickOpenTarget` | 单击打开方式 | `self` 或 `blank` |
| `system.middleClickOpenTarget` | 中键打开方式 | `self` 或 `blank` |
| `system.defaultSearchEngine` | 默认搜索引擎标识 | 必须指向内置或自定义引擎 |
| `system.customSearchEngines[]` | 自定义搜索引擎列表 | 可选 |
| `system.customSearchEngines[].id` | 自定义搜索引擎唯一标识 | 仅允许小写字母、数字和短横线 |
| `system.customSearchEngines[].name` | 自定义搜索引擎显示名称 | 非空字符串 |
| `system.customSearchEngines[].urlTemplate` | 搜索地址模板 | 必须包含 `{keyword}` |
| `system.webdavBackup.url` | WebDAV 服务地址 | 留空表示不启用 |
| `system.webdavBackup.username` | WebDAV 用户名 | 配置备份时必填 |
| `system.webdavBackup.password` | WebDAV 密码或应用专用密码 | 配置备份时必填 |
| `system.webdavBackup.remotePath` | 远端备份目录 | 默认 `/smart-harbor` |
| `system.webdavBackup.autoBackup` | 是否开启自动备份 | `true` 或 `false` |
| `system.webdavBackup.intervalDays` | 自动备份间隔天数 | `1` 到 `365` 的整数 |
| `system.webdavBackup.maxVersions` | 保留的远端备份版本数 | `1` 到 `365` 的整数 |
| `system.auth.username` | 管理员用户名 | 首次设置后写入 |
| `system.auth.passwordHash` | 管理员密码哈希 | 不要保存明文密码 |

#### `services`

| 路径 | 说明 | 备注 |
| --- | --- | --- |
| `services[]` | 顶层书签分组列表 | 数组 |
| `services[].category` | 分组名称 | 非空字符串 |
| `services[].items[]` | 分组中的书签项 | 数组 |
| `services[].items[].slug` | 书签唯一标识 | 仅允许小写字母、数字和短横线 |
| `services[].items[].name` | 书签显示名称 | 非空字符串 |
| `services[].items[].icon` | Lucide 图标名称 | 可选 |
| `services[].items[].primaryUrl` | 主地址，通常填局域网地址 | 必填 URL |
| `services[].items[].secondaryUrl` | 切换地址，通常填公网地址 | 可选 URL |
| `services[].items[].probes[]` | 用于探测当前网络可达性的地址列表 | 可选，至少一个 URL |
| `services[].items[].forceNewTab` | 是否强制在新标签页打开该书签 | 可选布尔值 |

</details>

<details>
<summary><code>config.json</code> 示例</summary>

```json
{
  "system": {
    "appName": "Smart Harbor",
    "darkMode": false,
    "clickOpenTarget": "self",
    "middleClickOpenTarget": "blank",
    "defaultSearchEngine": "google",
    "customSearchEngines": [
      {
        "id": "my-search",
        "name": "自定义搜索",
        "urlTemplate": "https://example.com/search?q={keyword}"
      }
    ],
    "webdavBackup": {
      "url": "https://dav.example.com/remote.php/dav/files/demo",
      "username": "demo",
      "password": "app-password",
      "remotePath": "/smart-harbor",
      "autoBackup": true,
      "intervalDays": 7,
      "maxVersions": 10
    },
    "auth": {
      "username": "admin",
      "passwordHash": "<generated-after-setup>"
    }
  },
  "services": [
    {
      "category": "基础设施",
      "items": [
        {
          "slug": "proxmox",
          "name": "Proxmox",
          "icon": "Server",
          "primaryUrl": "http://192.168.1.10:8006",
          "secondaryUrl": "https://proxmox.example.com",
          "probes": [
            "http://192.168.1.1"
          ],
          "forceNewTab": true
        }
      ]
    }
  ]
}
```

</details>

## 账号与安全

- 首次访问会引导你创建管理员账号。
- 如果需要重置登录信息，删除 `config.json` 中的 `system.auth` 段后刷新页面即可。
- 连续登录失败 5 次后，会锁定 30 分钟。

## Chrome 新标签页插件

如果你希望每次打开 Chrome 新标签页都直接进入 Smart Harbor，可以使用仓库内置插件。

- `primaryUrl`：优先访问的地址，通常填写局域网地址
- `fallbackUrl`：备用地址，通常填写公网地址
- `openMode`：`embedded` 表示在新标签页中以内嵌方式打开，`direct` 表示直接跳转
- `probeTimeoutMs`：地址探测超时时间，默认 `200`
- 点击浏览器工具栏中的插件图标即可打开设置页

### 安装方式

1. 从 GitHub Releases 下载插件包，或在本地自行构建。
2. 打开 `chrome://extensions`。
3. 开启开发者模式。
4. 点击“加载已解压的扩展程序”。
5. 选择 `extension/smart-harbor-new-tab-v<version>`。

### 本地构建

```bash
npm run build:extension
npm run package:extension
```

生成结果：

- 目录：`extension/smart-harbor-new-tab-v<version>`
- 压缩包：`extension/smart-harbor-new-tab-v<version>.zip`

## 本地开发

```bash
npm install
npm run dev
```

- 前端：`http://localhost:3000`
- 后端 API：`http://localhost:3001`

常用命令：

```bash
npm run lint
npm run test
npm run build
npm run preview
```

## 技术栈

React 19、TypeScript、Vite、Tailwind CSS、Zustand、TanStack Query、Fastify、Zod。

## 感谢支持

感谢 OpenAI Codex 和 Claude 在实现、迭代与文档整理过程中提供的支持。

## 许可证

[Apache-2.0](LICENSE)
