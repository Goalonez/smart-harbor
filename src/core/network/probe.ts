/**
 * 带超时的网络探测
 * @param url 探测地址
 * @param timeout 超时时间（毫秒）
 * @returns 是否可达
 */
export async function probe(url: string, timeout: number = 1200): Promise<boolean> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    await fetch(url, {
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal,
      cache: 'no-store',
    })
    clearTimeout(timeoutId)
    // no-cors 模式下 response.ok 不可靠，只要没抛错就认为可达
    return true
  } catch {
    clearTimeout(timeoutId)
    // 超时或网络错误
    return false
  }
}
