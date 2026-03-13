interface ChromeStorageArea {
  get(key: string): Promise<Record<string, unknown>>
  set(items: Record<string, unknown>): Promise<void>
}

interface ChromeStorageNamespace {
  sync: ChromeStorageArea
  local: ChromeStorageArea
}

interface ChromePermissionsNamespace {
  contains(details: { origins: string[] }): Promise<boolean>
  request(details: { origins: string[] }): Promise<boolean>
}

interface ChromeRuntimeNamespace {
  openOptionsPage(): Promise<void>
}

interface ChromeActionNamespace {
  onClicked: {
    addListener(callback: () => void): void
  }
}

interface ChromeLike {
  action: ChromeActionNamespace
  permissions: ChromePermissionsNamespace
  runtime: ChromeRuntimeNamespace
  storage: ChromeStorageNamespace
}

declare const chrome: ChromeLike
