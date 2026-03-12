export type OpenMode = 'embedded' | 'direct'

export interface ExtensionSettings {
  primaryUrl: string
  fallbackUrl: string
  openMode: OpenMode
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
