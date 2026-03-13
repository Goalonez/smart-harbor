export type ExtensionLanguage = 'zh-CN' | 'en'

export type OpenMode = 'embedded' | 'direct'

export interface ExtensionSettings {
  primaryUrl: string
  fallbackUrl: string
  openMode: OpenMode
  probeTimeoutMs: number
}

export type ResolutionReason =
  | 'primary'
  | 'fallback'
  | 'primary-unverified'
  | 'fallback-unverified'
  | 'unconfigured'

export interface ResolvedTarget {
  activeUrl: string
  reason: ResolutionReason
}

export interface ResolutionCache {
  primaryUrl: string
  fallbackUrl: string
  activeUrl: string
  reason: Exclude<ResolutionReason, 'unconfigured'>
  resolvedAt: number
}
