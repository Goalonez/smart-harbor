import type { NetworkMode } from './detectNetworkMode'

export type NetworkModeStrategy = 'auto' | 'manual'
export type ManualNetworkMode = Exclude<NetworkMode, 'unknown'>

export const NETWORK_MODE_STRATEGY_STORAGE_KEY = 'smart-harbor-network-mode-strategy'
export const MANUAL_NETWORK_MODE_STORAGE_KEY = 'smart-harbor-manual-network-mode'

const DEFAULT_NETWORK_MODE_STRATEGY: NetworkModeStrategy = 'auto'
const DEFAULT_MANUAL_NETWORK_MODE: ManualNetworkMode = 'lan'

function normalizeNetworkModeStrategy(value: string | null): NetworkModeStrategy {
  return value === 'manual' ? 'manual' : DEFAULT_NETWORK_MODE_STRATEGY
}

function normalizeManualNetworkMode(value: string | null): ManualNetworkMode {
  return value === 'wan' ? 'wan' : DEFAULT_MANUAL_NETWORK_MODE
}

export function resolveInitialNetworkModeStrategy(): NetworkModeStrategy {
  if (typeof window === 'undefined') {
    return DEFAULT_NETWORK_MODE_STRATEGY
  }

  return normalizeNetworkModeStrategy(
    window.localStorage.getItem(NETWORK_MODE_STRATEGY_STORAGE_KEY)
  )
}

export function resolveInitialManualNetworkMode(): ManualNetworkMode {
  if (typeof window === 'undefined') {
    return DEFAULT_MANUAL_NETWORK_MODE
  }

  return normalizeManualNetworkMode(window.localStorage.getItem(MANUAL_NETWORK_MODE_STORAGE_KEY))
}

export function persistNetworkModeStrategy(strategy: NetworkModeStrategy) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(NETWORK_MODE_STRATEGY_STORAGE_KEY, strategy)
}

export function persistManualNetworkMode(mode: ManualNetworkMode) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(MANUAL_NETWORK_MODE_STORAGE_KEY, mode)
}

export function resolveEffectiveNetworkMode(
  detectedMode: NetworkMode,
  strategy: NetworkModeStrategy,
  manualMode: ManualNetworkMode
): NetworkMode {
  if (strategy === 'manual') {
    return manualMode
  }

  return detectedMode
}
