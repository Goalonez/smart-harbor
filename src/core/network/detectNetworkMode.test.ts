import { describe, it, expect, vi, beforeEach } from 'vitest'
import { detectNetworkMode } from '@/core/network/detectNetworkMode'
import type { Service } from '@/config/schema'
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
