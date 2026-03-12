# Smart Harbor

[中文](README.zh-CN.md)

Your personal bookmark homepage that gets smarter with your network. Whether you're at home or on the go, Smart Harbor automatically shows the right links for your current location.

## What Makes It Smart

- **Location-aware bookmarks**: Automatically switches between home and external URLs based on your network
- **Visual bookmark manager**: Drag-and-drop organization with beautiful icons and categories
- **Cloud backup**: Keep your bookmarks safe with WebDAV sync and automatic backups
- **Secure access**: Password-protected admin panel with smart lockout protection
- **Beautiful interface**: Dark mode support and mobile-friendly design
- **Simple setup**: Everything stored in one config file - easy to backup and restore

## Quick Start

### Option 1: Docker Run (Simple)

Perfect for trying out Smart Harbor quickly:

```bash
docker run -d \
  --name smart-harbor \
  -p 8080:80 \
  -v $(pwd)/config:/app/config \
  goalonez/smart-harbor:latest
```

### Option 2: Docker Compose (Recommended)

For production use with better resource management:

```bash
# Download the compose file
curl -O https://raw.githubusercontent.com/goalonez/smart-harbor/main/docker-compose.yml

# Start the service
docker compose up -d
```

Or create your own `docker-compose.yml`:

```yaml
services:
  smart-harbor:
    image: goalonez/smart-harbor:latest
    container_name: smart-harbor
    ports:
      - 8080:80
    volumes:
      - ./config:/app/config
      # Alternative paths (uncomment one if needed):
      # - ~/docker/smart-harbor/config:/app/config  # Home directory
      # - /data/docker/smart-harbor/config:/app/config  # System data directory
    restart: unless-stopped
    networks:
      - defaultnet
    mem_limit: 4g
    cpus: 3

networks:
  defaultnet:
    external: true
```

### Getting Started

1. Open `http://localhost:8080` in your browser
2. Create your admin account on first visit
3. Start adding your bookmarks and organizing them into categories

Your settings and bookmarks are automatically saved to the mounted config folder.

## Customization

Smart Harbor creates a `config.json` file when you first start it. This file contains all your settings and bookmarks:

| Setting | What it does |
|---------|--------------|
| `system.appName` | Change the page title to your liking |
| `system.darkMode` | Toggle between light and dark themes |
| `system.defaultSearchEngine` | Set your preferred search engine |
| `system.webdavBackup` | Configure automatic cloud backups |
| `services` | Your bookmark categories and links |

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

## Managing Your Account

### First Time Setup
When you first visit Smart Harbor, you'll be guided through creating an admin account. This keeps your bookmarks private and secure.

### Forgot Your Password?
No worries! Just remove the `system.auth` section from your `config.json` file and refresh the page. You'll be able to create a new password.

### Security Features
- After 5 failed login attempts, access is locked for 30 minutes
- Passwords are securely hashed and never stored in plain text

## Chrome New Tab Extension

Smart Harbor can be paired with the built-in Chrome new tab extension in this repository. This is useful when you want Chrome to open your homepage directly in every new tab, while still supporting automatic switching between LAN and internet addresses.

### What the extension does

- Replaces Chrome's new tab page with Smart Harbor
- Tries your primary URL first, then automatically switches to the fallback URL
- Supports two opening modes:
- `embedded`: opens Smart Harbor inside the new tab with a full-page iframe
- `direct`: redirects the new tab directly to your Smart Harbor URL
- Opens the extension settings page when you click the toolbar icon

### Recommended setup

Use this when you deploy Smart Harbor to both a local network address and a public address:

- `Primary URL`: your preferred address, usually the faster LAN address
- `Fallback URL`: the backup address, usually your internet-facing address
- `Open Mode`: choose `embedded` if you want to stay inside the Chrome new tab page, or `direct` if you want pure URL navigation

### Install the extension

1. Download the extension package from GitHub Releases, or build it locally.
2. Open `chrome://extensions`.
3. Enable Developer mode.
4. Click `Load unpacked`.
5. Select the generated extension folder, for example `extension/smart-harbor-new-tab-v1.0.0`.

### Build locally

```bash
npm run build:extension
npm run package:extension
```

The packaged extension will be generated as:

- folder: `extension/smart-harbor-new-tab-v<version>`
- zip: `extension/smart-harbor-new-tab-v<version>.zip`

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
