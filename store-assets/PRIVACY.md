# Privacy Policy — Smart Harbor New Tab

_Last updated: 2026-06-13_

## English

Smart Harbor New Tab is a Chrome extension that replaces the new tab page with a
personal homepage and automatically switches between a user-configured primary
and fallback URL based on reachability.

### Data we collect

**None.** This extension does not collect, transmit, sell, or share any personal
data with the developer or any third party.

### Data stored locally

All data is stored only in your browser through the Chrome storage API and never
leaves your device except as part of the reachability probes described below:

- **Settings** — the primary URL, fallback URL, open mode, and probe timeout you
  configure (`chrome.storage.sync`).
- **Language preference** — your selected interface language (`chrome.storage.sync`).
- **Reachability cache** — a short-lived (10 seconds) record of the last
  reachability result, used to avoid redundant checks (`chrome.storage.local`).

### Network requests

The only network requests this extension makes are lightweight `GET` requests to
the `/api/health` endpoint of the URLs **you** configure. These requests are sent
directly to your own addresses to determine which one is reachable. No data is
sent to the developer, to analytics services, or to any third party.

### Permissions

- **storage** — to save your settings, language preference, and the short-lived
  reachability cache locally.
- **permissions** — to request host access only for the specific URLs you enter,
  at the time you save them.
- **Optional host permissions (`http://*/*`, `https://*/*`)** — never requested
  up front. They are requested only for the specific origin you enter, so the
  extension can probe that address. HTTP is supported because the target is often
  a self-hosted service on a local network, which commonly runs over plain HTTP.

### Contact

For questions about this policy, please open an issue at
<https://github.com/Goalonez/smart-harbor>.

---

## 中文

Smart Harbor New Tab 是一款 Chrome 扩展,将新标签页替换为个人主页,并根据可达性在
用户配置的主地址与备用地址之间自动切换。

### 我们收集的数据

**无。** 本扩展不会向开发者或任何第三方收集、传输、出售或共享任何个人数据。

### 本地存储的数据

所有数据仅通过 Chrome 存储 API 保存在你的浏览器中,除下文所述的可达性探测外,不会
离开你的设备:

- **设置** — 你配置的主地址、备用地址、打开方式与探测超时(`chrome.storage.sync`)。
- **语言偏好** — 你选择的界面语言(`chrome.storage.sync`)。
- **可达性缓存** — 有效期 10 秒的最近一次可达性结果,用于避免重复检测
  (`chrome.storage.local`)。

### 网络请求

本扩展唯一的网络请求,是向**你自己**配置的地址的 `/api/health` 端点发起的轻量
`GET` 请求。这些请求直接发往你填写的地址,用于判断哪个地址可达。不会向开发者、
分析服务或任何第三方发送任何数据。

### 权限说明

- **storage** — 用于在本地保存你的设置、语言偏好与短期可达性缓存。
- **permissions** — 仅在你保存设置时,针对你填写的具体地址按需申请主机访问权限。
- **可选主机权限(`http://*/*`、`https://*/*`)** — 默认不申请,仅针对你填写的
  具体来源申请,以便探测该地址。支持 HTTP 是因为目标通常是局域网内的自建服务,
  这类服务常以明文 HTTP 运行。

### 联系方式

如对本政策有疑问,请在 <https://github.com/Goalonez/smart-harbor> 提交 issue。
