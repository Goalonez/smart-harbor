const protocolPattern = /^https?:\/\//i
const localhostOrIpPattern = /^(localhost|(?:\d{1,3}\.){3}\d{1,3})(?::\d{1,5})?(?:[/?#].*)?$/i
const domainPattern = /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}(?::\d{1,5})?(?:[/?#].*)?$/i

export function resolveDirectUrl(input: string): string | null {
  const value = input.trim()

  if (!value || /\s/.test(value)) {
    return null
  }

  let candidate = value

  if (!protocolPattern.test(value)) {
    if (localhostOrIpPattern.test(value)) {
      candidate = `http://${value}`
    } else if (domainPattern.test(value)) {
      candidate = `https://${value}`
    } else {
      return null
    }
  }

  try {
    const parsed = new URL(candidate)

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null
    }

    return parsed.toString()
  } catch {
    return null
  }
}
