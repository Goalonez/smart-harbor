import { probe } from './probe'
import type { Service } from '@/config/schema'

export type NetworkMode = 'lan' | 'wan' | 'unknown'

/**
 * 检测网络模式
 * @param services 服务列表
 * @returns 网络模式
 */
export async function detectNetworkMode(services: Service[]): Promise<NetworkMode> {
  // 没有服务时无法判断网络类型
  if (services.length === 0) {
    return 'unknown'
  }

  // 仅探测第一个服务，优先使用其第一个自定义探针，否则直接探测主地址
  const firstService = services[0]
  const probeUrl = firstService.probes?.[0] ?? firstService.primaryUrl
  const reachable = await probe(probeUrl, 1200)

  return reachable ? 'lan' : 'wan'
}
