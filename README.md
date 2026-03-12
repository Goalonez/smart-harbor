# Smart Harbor

[中文](README.zh-CN.md)

A self-hosted smart bookmark navigation page built with vibe coding. Auto-detects LAN/WAN environment and switches URLs accordingly.

## Features

- Auto-detect LAN / WAN and switch between primary and secondary URLs
- Visual bookmark editor with drag-and-drop ordering, icon picker, and JSON mode
- WebDAV backup with scheduled auto-backup and version restore
- Admin authentication with scrypt password hashing
- Dark mode and responsive layout
- Single `config.json` file for all configuration — easy to back up and restore

## Quick Start

```bash
docker run -d \
  --name smart-harbor \
  -p 8080:80 \
  -v $(pwd)/config:/app/config \
  goalonez/smart-harbor:latest
```

Open `http://localhost:8080` and create your admin account on first visit.

All configuration is stored in the mounted `config/config.json`.

## Configuration

The app generates a default `config.json` on first startup. Key sections:

| Field | Description |
|-------|-------------|
| `system.appName` | Page title |
| `system.darkMode` | Enable dark mode |
| `system.defaultSearchEngine` | Default search engine ID |
| `system.customSearchEngines` | Custom search engine list |
| `system.webdavBackup` | WebDAV remote backup settings |
| `services` | Bookmark groups and items |

<details>
<summary>Example config.json</summary>

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
      "category": "Example",
      "items": [
        {
          "slug": "example",
          "name": "Example",
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

## Authentication

- First visit: create an admin account (when `system.auth` is missing)
- Password reset: remove `system.auth` from `config.json` and reload
- Lockout: 5 failed attempts → 30 min lockout

## Development

```bash
npm install
npm run dev
```

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001`

```bash
npm run build
npm run preview
```

## Tech Stack

React 19 · TypeScript · Vite · Tailwind CSS · Zustand · TanStack Query · Fastify · Zod

## License

[Apache-2.0](LICENSE)
