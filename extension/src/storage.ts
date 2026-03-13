import type {
  ExtensionLanguage,
  ExtensionSettings,
  OpenMode,
  ResolutionCache,
  ResolutionReason,
} from '@extension/types'

const STORAGE_KEY = 'smartHarborNewTabSettings'
const LANGUAGE_STORAGE_KEY = 'smartHarborNewTabLanguage'
const RESOLUTION_CACHE_KEY = 'smartHarborNewTabResolutionCache'

export const MIN_PROBE_TIMEOUT_MS = 50
export const MAX_PROBE_TIMEOUT_MS = 5000
export const DEFAULT_PROBE_TIMEOUT_MS = 200
export const RESOLUTION_CACHE_TTL_MS = 10_000
export const defaultLanguage = detectPreferredLanguage()

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeOpenMode(value: unknown): OpenMode {
  return value === 'embedded' ? 'embedded' : 'direct'
}

function detectPreferredLanguage(): ExtensionLanguage {
  const locale = globalThis.navigator?.language?.toLowerCase() ?? ''
  return locale.startsWith('zh') ? 'zh-CN' : 'en'
}

function normalizeLanguage(value: unknown): ExtensionLanguage {
  return value === 'en' ? 'en' : 'zh-CN'
}

function isCacheReason(value: unknown): value is Exclude<ResolutionReason, 'unconfigured'> {
  return (
    value === 'primary' ||
    value === 'fallback' ||
    value === 'primary-unverified' ||
    value === 'fallback-unverified'
  )
}

export function normalizeProbeTimeoutMs(value: unknown): number {
  const numeric = typeof value === 'number' ? value : Number(value)

  if (!Number.isFinite(numeric)) {
    return DEFAULT_PROBE_TIMEOUT_MS
  }

  return Math.min(MAX_PROBE_TIMEOUT_MS, Math.max(MIN_PROBE_TIMEOUT_MS, Math.round(numeric)))
}

export const defaultSettings: ExtensionSettings = {
  primaryUrl: '',
  fallbackUrl: '',
  openMode: 'direct',
  probeTimeoutMs: DEFAULT_PROBE_TIMEOUT_MS,
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
  const nextSettings = stored[STORAGE_KEY]

  if (!isRecord(nextSettings)) {
    return defaultSettings
  }

  return {
    primaryUrl: typeof nextSettings.primaryUrl === 'string' ? nextSettings.primaryUrl : '',
    fallbackUrl: typeof nextSettings.fallbackUrl === 'string' ? nextSettings.fallbackUrl : '',
    openMode: normalizeOpenMode(nextSettings.openMode),
    probeTimeoutMs: normalizeProbeTimeoutMs(nextSettings.probeTimeoutMs),
  }
}

export async function writeSettings(settings: ExtensionSettings): Promise<void> {
  const normalized: ExtensionSettings = {
    primaryUrl: settings.primaryUrl,
    fallbackUrl: settings.fallbackUrl,
    openMode: normalizeOpenMode(settings.openMode),
    probeTimeoutMs: normalizeProbeTimeoutMs(settings.probeTimeoutMs),
  }

  await chrome.storage.sync.set({
    [STORAGE_KEY]: normalized,
  })
}

export async function readLanguage(): Promise<ExtensionLanguage> {
  const stored = await chrome.storage.sync.get(LANGUAGE_STORAGE_KEY)
  return normalizeLanguage(stored[LANGUAGE_STORAGE_KEY] ?? defaultLanguage)
}

export async function writeLanguage(language: ExtensionLanguage): Promise<void> {
  await chrome.storage.sync.set({
    [LANGUAGE_STORAGE_KEY]: normalizeLanguage(language),
  })
}

export async function readResolutionCache(): Promise<ResolutionCache | null> {
  const stored = await chrome.storage.local.get(RESOLUTION_CACHE_KEY)
  const nextCache = stored[RESOLUTION_CACHE_KEY]

  if (!isRecord(nextCache)) {
    return null
  }

  if (
    typeof nextCache.primaryUrl !== 'string' ||
    typeof nextCache.fallbackUrl !== 'string' ||
    typeof nextCache.activeUrl !== 'string' ||
    !isCacheReason(nextCache.reason) ||
    typeof nextCache.resolvedAt !== 'number' ||
    !Number.isFinite(nextCache.resolvedAt)
  ) {
    return null
  }

  return {
    primaryUrl: nextCache.primaryUrl,
    fallbackUrl: nextCache.fallbackUrl,
    activeUrl: nextCache.activeUrl,
    reason: nextCache.reason,
    resolvedAt: nextCache.resolvedAt,
  }
}

export async function writeResolutionCache(cache: ResolutionCache): Promise<void> {
  await chrome.storage.local.set({
    [RESOLUTION_CACHE_KEY]: cache,
  })
}
