import { probe } from './probe'
import { buildNetworkProbeUrl, hasCompleteNetworkProbeConfig } from '@/config/networkProbe'
import type { NetworkProbeConfig, Service } from '@/config/schema'

export type NetworkMode = 'lan' | 'wan' | 'unknown'

/**
 * 检测网络模式
 * @param services 服务列表
 * @returns 网络模式
 */
export async function detectNetworkMode(
  services: Service[],
  networkProbe?: NetworkProbeConfig | null
): Promise<NetworkMode> {
  if (networkProbe && hasCompleteNetworkProbeConfig(networkProbe)) {
    const lanProbeUrl = buildNetworkProbeUrl(networkProbe.lanProtocol, networkProbe.lanHost)
    const wanProbeUrl = buildNetworkProbeUrl(networkProbe.wanProtocol, networkProbe.wanHost)

    if (await probe(lanProbeUrl, 1200)) {
      return 'lan'
    }

    if (await probe(wanProbeUrl, 1200)) {
      return 'wan'
    }

    return 'unknown'
  }

  // 没有服务时无法判断网络类型
  if (services.length === 0) {
    return 'unknown'
  }

  // 回退到第一个服务，优先使用其第一个自定义探针，否则直接探测主地址
  const firstService = services[0]
  const probeUrl = firstService.probes?.[0] ?? firstService.primaryUrl
  const reachable = await probe(probeUrl, 1200)

  return reachable ? 'lan' : 'wan'
}
