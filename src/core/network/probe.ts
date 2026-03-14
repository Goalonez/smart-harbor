/**
 * 带超时的网络探测
 * @param url 探测地址
 * @param timeout 超时时间（毫秒）
 * @returns 是否可达
 */
export async function probe(url: string, timeout: number = 1200): Promise<boolean> {
  const supportsNativeTimeoutSignal =
    typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function'
  const controller = supportsNativeTimeoutSignal ? null : new AbortController()
  const signal = supportsNativeTimeoutSignal ? AbortSignal.timeout(timeout) : controller?.signal
  const timeoutId = controller ? window.setTimeout(() => controller.abort(), timeout) : null

  try {
    await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors',
      signal,
      cache: 'no-store',
    })
    // no-cors 模式下 response.ok 不可靠，只要没抛错就认为可达
    return true
  } catch {
    // 超时或网络错误
    return false
  } finally {
    if (timeoutId !== null) {
      window.clearTimeout(timeoutId)
    }
  }
}
