import { describe, it, expect, vi, beforeEach } from 'vitest'
import { detectNetworkMode } from '@/core/network/detectNetworkMode'
import type { NetworkProbeConfig, Service } from '@/config/schema'
import * as probeModule from '@/core/network/probe'

vi.mock('@/core/network/probe', () => ({
  probe: vi.fn(),
}))

describe('detectNetworkMode', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockServices: Service[] = [
    {
      slug: 'service-1',
      name: 'Service 1',
      category: '服务',
      primaryUrl: 'http://192.168.1.100:8080',
      secondaryUrl: 'https://service1.example.com',
      probes: ['http://192.168.1.100:8080/health'],
    },
    {
      slug: 'service-2',
      name: 'Service 2',
      category: '服务',
      primaryUrl: 'http://192.168.1.101:8081',
      secondaryUrl: 'https://service2.example.com',
    },
  ]

  const networkProbe: NetworkProbeConfig = {
    lanProtocol: 'http',
    lanHost: '192.168.1.100:3001',
    wanProtocol: 'https',
    wanHost: 'harbor.example.com',
  }

  it('should return "lan" when configured LAN health probe succeeds', async () => {
    vi.mocked(probeModule.probe).mockResolvedValueOnce(true)

    const result = await detectNetworkMode(mockServices, networkProbe)

    expect(result).toBe('lan')
    expect(probeModule.probe).toHaveBeenCalledTimes(1)
    expect(probeModule.probe).toHaveBeenCalledWith('http://192.168.1.100:3001/api/health', 1200)
  })

  it('should return "wan" when configured LAN probe fails but WAN probe succeeds', async () => {
    vi.mocked(probeModule.probe).mockResolvedValueOnce(false).mockResolvedValueOnce(true)

    const result = await detectNetworkMode(mockServices, networkProbe)

    expect(result).toBe('wan')
    expect(probeModule.probe).toHaveBeenCalledTimes(2)
    expect(probeModule.probe).toHaveBeenNthCalledWith(1, 'http://192.168.1.100:3001/api/health', 1200)
    expect(probeModule.probe).toHaveBeenNthCalledWith(2, 'https://harbor.example.com/api/health', 1200)
  })

  it('should return "unknown" when configured health probes are both unreachable', async () => {
    vi.mocked(probeModule.probe).mockResolvedValueOnce(false).mockResolvedValueOnce(false)

    const result = await detectNetworkMode(mockServices, networkProbe)

    expect(result).toBe('unknown')
  })

  it('should return "lan" when first service probe succeeds', async () => {
    vi.mocked(probeModule.probe).mockResolvedValueOnce(true)

    const result = await detectNetworkMode(mockServices)
    expect(result).toBe('lan')
    expect(probeModule.probe).toHaveBeenCalledTimes(1)
    expect(probeModule.probe).toHaveBeenCalledWith('http://192.168.1.100:8080/health', 1200)
  })

  it('should return "wan" when first service probe fails', async () => {
    vi.mocked(probeModule.probe).mockResolvedValueOnce(false)

    const result = await detectNetworkMode(mockServices)
    expect(result).toBe('wan')
    expect(probeModule.probe).toHaveBeenCalledTimes(1)
  })

  it('should return "unknown" when no services provided', async () => {
    const result = await detectNetworkMode([])
    expect(result).toBe('unknown')
  })

  it('should fall back to the first service probe when network probe config is incomplete', async () => {
    vi.mocked(probeModule.probe).mockResolvedValueOnce(true)

    const result = await detectNetworkMode(mockServices, {
      lanProtocol: 'http',
      lanHost: '192.168.1.100:3001',
      wanProtocol: 'https',
      wanHost: '',
    })

    expect(result).toBe('lan')
    expect(probeModule.probe).toHaveBeenCalledTimes(1)
    expect(probeModule.probe).toHaveBeenCalledWith('http://192.168.1.100:8080/health', 1200)
  })

  it('should use first service primaryUrl when probes not configured', async () => {
    const servicesWithoutProbes: Service[] = [
      {
        slug: 'service',
        name: 'Service',
        category: '服务',
        primaryUrl: 'http://192.168.1.100:8080',
        secondaryUrl: 'https://service.example.com',
      },
    ]

    vi.mocked(probeModule.probe).mockResolvedValue(true)

    await detectNetworkMode(servicesWithoutProbes)
    expect(probeModule.probe).toHaveBeenCalledWith('http://192.168.1.100:8080', 1200)
  })

  it('should only probe the first service even if multiple services exist', async () => {
    vi.mocked(probeModule.probe).mockResolvedValueOnce(false)

    await detectNetworkMode(mockServices)

    expect(probeModule.probe).toHaveBeenCalledTimes(1)
    expect(probeModule.probe).toHaveBeenCalledWith('http://192.168.1.100:8080/health', 1200)
  })
})
