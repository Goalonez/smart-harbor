import type { ResolvedTarget } from '@extension/types'

const CHECK_TIMEOUT_MS = 1600

function getOriginPattern(url: string): string {
  const parsed = new URL(url)
  return `${parsed.origin}/*`
}

export function getPermissionOrigins(urls: string[]): string[] {
  return Array.from(
    new Set(
      urls
        .filter(Boolean)
        .map((url) => getOriginPattern(url))
    )
  )
}

async function hasOriginPermission(url: string): Promise<boolean> {
  return chrome.permissions.contains({
    origins: [getOriginPattern(url)],
  })
}

export async function requestOriginPermissions(urls: string[]): Promise<boolean> {
  const origins = getPermissionOrigins(urls)
  if (origins.length === 0) {
    return true
  }

  return chrome.permissions.request({ origins })
}

async function probe(baseUrl: string): Promise<boolean | null> {
  if (!(await hasOriginPermission(baseUrl))) {
    return null
  }

  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS)

  try {
    const healthUrl = new URL('/api/health', baseUrl).toString()
    const response = await fetch(healthUrl, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
    })
    return response.ok
  } catch {
    return false
  } finally {
    window.clearTimeout(timeoutId)
  }
}

export async function resolveAvailableTarget(
  primaryUrl: string,
  fallbackUrl: string
): Promise<ResolvedTarget> {
  if (!primaryUrl && !fallbackUrl) {
    return {
      activeUrl: '',
      reason: 'unconfigured',
    }
  }

  if (!primaryUrl) {
    return {
      activeUrl: fallbackUrl,
      reason: 'fallback-unverified',
    }
  }

  const primaryReachable = await probe(primaryUrl)
  if (primaryReachable !== false) {
    return {
      activeUrl: primaryUrl,
      reason: primaryReachable === null ? 'primary-unverified' : 'primary',
    }
  }

  if (!fallbackUrl) {
    return {
      activeUrl: primaryUrl,
      reason: 'primary-unverified',
    }
  }

  const fallbackReachable = await probe(fallbackUrl)
  return {
    activeUrl: fallbackUrl,
    reason: fallbackReachable === null ? 'fallback-unverified' : 'fallback',
  }
}
