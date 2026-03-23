export const networkProbeProtocols = ['http', 'https'] as const
export const NETWORK_PROBE_PATH = '/api/health'

const protocolPrefixPattern = /^[a-z][a-z\d+.-]*:\/\//i

export function normalizeNetworkProbeHost(host: string) {
  return host.trim()
}

export function isValidNetworkProbeHost(host: string) {
  const normalizedHost = normalizeNetworkProbeHost(host)

  if (!normalizedHost) {
    return false
  }

  if (
    protocolPrefixPattern.test(normalizedHost) ||
    normalizedHost.includes('@') ||
    /[/?#]/.test(normalizedHost)
  ) {
    return false
  }

  try {
    const parsed = new URL(`http://${normalizedHost}`)
    return parsed.hostname.length > 0
  } catch {
    return false
  }
}

export function buildNetworkProbeUrl(
  protocol: (typeof networkProbeProtocols)[number],
  host: string
) {
  return `${protocol}://${normalizeNetworkProbeHost(host)}${NETWORK_PROBE_PATH}`
}

export function hasCompleteNetworkProbeConfig(
  config?: {
    lanHost?: string | null
    wanHost?: string | null
  } | null
) {
  return Boolean(config?.lanHost?.trim() && config?.wanHost?.trim())
}
