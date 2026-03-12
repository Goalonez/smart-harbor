import type { OpenTarget } from '@/config/schema'
import type { ResolvedUrls } from './resolveTargetUrl'

interface OpenWithFallbackOptions {
  target?: OpenTarget
}

function openUrl(url: string, target: OpenTarget, popup: Window | null) {
  if (target === 'blank') {
    if (popup && !popup.closed) {
      popup.location.replace(url)
      popup.focus()
      return
    }

    window.open(url, '_blank')
    return
  }

  window.location.assign(url)
}

export async function openWithFallback(
  urls: ResolvedUrls,
  options: OpenWithFallbackOptions = {}
): Promise<void> {
  const target = options.target ?? 'self'
  const popup = target === 'blank' ? window.open('', '_blank') : null

  if (popup) {
    popup.opener = null
  }

  openUrl(urls.primary, target, popup)
}
