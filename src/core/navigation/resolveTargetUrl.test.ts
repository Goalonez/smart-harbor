import { describe, it, expect } from 'vitest'
import { resolveTargetUrl } from '@/core/navigation/resolveTargetUrl'
import type { Service } from '@/config/schema'

describe('resolveTargetUrl', () => {
  const mockService: Service = {
    slug: 'test-service',
    name: 'Test Service',
    category: '服务',
    primaryUrl: 'http://192.168.1.100:8080',
    secondaryUrl: 'https://test.example.com',
  }

  it('should return primaryUrl as primary when in lan mode', () => {
    const result = resolveTargetUrl(mockService, 'lan')
    expect(result.primary).toBe('http://192.168.1.100:8080')
    expect(result.fallback).toBe('https://test.example.com')
  })

  it('should return secondaryUrl as primary when in wan mode', () => {
    const result = resolveTargetUrl(mockService, 'wan')
    expect(result.primary).toBe('https://test.example.com')
    expect(result.fallback).toBe('http://192.168.1.100:8080')
  })

  it('should return primaryUrl as primary when in unknown mode', () => {
    const result = resolveTargetUrl(mockService, 'unknown')
    expect(result.primary).toBe('http://192.168.1.100:8080')
    expect(result.fallback).toBe('https://test.example.com')
  })

  it('should keep using primaryUrl when secondaryUrl is missing', () => {
    const result = resolveTargetUrl(
      {
        ...mockService,
        secondaryUrl: undefined,
      },
      'wan'
    )

    expect(result.primary).toBe('http://192.168.1.100:8080')
    expect(result.fallback).toBeUndefined()
  })
})
