# Smart Harbor

[English](README.md)

你的专属书签主页，会根据网络环境自动变聪明。无论在家还是外出，Smart Harbor 都会为你显示最合适的链接地址。

## 为什么选择 Smart Harbor

- **智能地址切换**：根据网络环境自动在内网和外网地址间切换
- **可视化书签管理**：拖拽排序，精美图标，分类整理一应俱全
- **云端备份**：WebDAV 同步，定时备份，数据永不丢失
- **安全访问**：密码保护的管理面板，智能防暴力破解
- **精美界面**：深色模式，移动端适配，使用体验极佳
- **简单配置**：所有设置存储在一个文件中，备份迁移超方便

## 快速部署

### 方式一：Docker 命令（简单快速）

适合快速体验 Smart Harbor：

```bash
docker run -d \
  --name smart-harbor \
  -p 8080:80 \
  -v $(pwd)/config:/app/config \
  goalonez/smart-harbor:latest
```

### 方式二：Docker Compose（推荐）

适合生产环境，资源管理更完善：

```bash
# 下载配置文件
curl -O https://raw.githubusercontent.com/goalonez/smart-harbor/main/docker-compose.yml

# 启动服务
docker compose up -d
```

或者创建自己的 `docker-compose.yml`：

```yaml
services:
  smart-harbor:
    image: goalonez/smart-harbor:latest
    container_name: smart-harbor
    ports:
      - 8080:80
    volumes:
      - ./config:/app/config
      # 可选路径（根据需要取消注释）：
      # - ~/docker/smart-harbor/config:/app/config  # 用户主目录
      # - /data/docker/smart-harbor/config:/app/config  # 系统数据目录
    restart: unless-stopped
    networks:
      - defaultnet
    mem_limit: 4g
    cpus: 3

networks:
  defaultnet:
    external: true
```

### 开始使用

1. 在浏览器中打开 `http://localhost:8080`
2. 首次访问时创建管理员账号
3. 开始添加书签并按分类整理

你的设置和书签会自动保存到挂载的配置文件夹中。

## 个性化设置

Smart Harbor 首次启动时会创建 `config.json` 配置文件，包含所有设置和书签：

| 设置项 | 作用 |
|--------|------|
| `system.appName` | 自定义页面标题 |
| `system.darkMode` | 切换明暗主题 |
| `system.defaultSearchEngine` | 设置默认搜索引擎 |
| `system.webdavBackup` | 配置自动云端备份 |
| `services` | 你的书签分类和链接 |

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

## 账号管理

### 首次设置
第一次访问 Smart Harbor 时，系统会引导你创建管理员账号，确保书签隐私和安全。

### 忘记密码？
别担心！删除 `config.json` 文件中的 `system.auth` 部分，然后刷新页面即可重新设置密码。

### 安全特性
- 连续登录失败 5 次后自动锁定 30 分钟
- 密码经过安全哈希处理，绝不明文存储

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
