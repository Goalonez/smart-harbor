import type { ExtensionSettings } from '@extension/types'

const STORAGE_KEY = 'smartHarborNewTabSettings'

export const defaultSettings: ExtensionSettings = {
  primaryUrl: '',
  fallbackUrl: '',
  openMode: 'embedded',
}

export function normalizeUrl(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) {
    return ''
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`
  const normalized = new URL(withProtocol)

  if (!normalized.pathname) {
    normalized.pathname = '/'
  }

  return normalized.toString()
}

export async function readSettings(): Promise<ExtensionSettings> {
  const stored = await chrome.storage.sync.get(STORAGE_KEY)
  return {
    ...defaultSettings,
    ...(stored[STORAGE_KEY] ?? {}),
  }
}

export async function writeSettings(settings: ExtensionSettings): Promise<void> {
  await chrome.storage.sync.set({
    [STORAGE_KEY]: settings,
  })
}
