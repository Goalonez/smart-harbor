import type { Service } from '@/config/schema'
import type { NetworkMode } from '@/core/network/detectNetworkMode'

export interface ResolvedUrls {
  primary: string
  fallback?: string
}

/**
 * 根据网络模式解析目标地址
 * @param service 服务配置
 * @param networkMode 网络模式
 * @returns 主地址和切换地址
 */
export function resolveTargetUrl(service: Service, networkMode: NetworkMode): ResolvedUrls {
  if (networkMode === 'wan' && service.secondaryUrl) {
    return {
      primary: service.secondaryUrl,
      fallback: service.primaryUrl,
    }
  }

  return {
    primary: service.primaryUrl,
    fallback: service.secondaryUrl,
  }
}
