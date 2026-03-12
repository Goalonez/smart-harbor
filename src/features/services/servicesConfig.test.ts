import { describe, expect, it } from 'vitest'
import type { ServicesConfig } from '@/config/schema'
import { validateBookmarkForm } from '@/features/services/bookmarkForm'
import { moveGroup, moveService, validateGroupName } from '@/features/services/servicesConfig'

const sampleConfig: ServicesConfig = [
  {
    category: '服务',
    items: [
      {
        slug: 'alpha',
        name: 'Alpha',
        primaryUrl: 'http://127.0.0.1:3000',
        secondaryUrl: 'https://alpha.example.com',
      },
      {
        slug: 'beta',
        name: 'Beta',
        primaryUrl: 'http://127.0.0.1:3001',
        secondaryUrl: 'https://beta.example.com',
      },
    ],
  },
  {
    category: '工具',
    items: [
      {
        slug: 'gamma',
        name: 'Gamma',
        primaryUrl: 'http://127.0.0.1:3002',
        secondaryUrl: 'https://gamma.example.com',
      },
    ],
  },
]

describe('servicesConfig helpers', () => {
  it('validates group names after trimming', () => {
    expect(validateGroupName('  新分组  ', sampleConfig)).toBe('新分组')
  })

  it('rejects duplicated group names', () => {
    expect(() => validateGroupName('工具', sampleConfig)).toThrow('分组“工具”已存在')
  })

  it('moves groups by index order', () => {
    const nextConfig = moveGroup(sampleConfig, 0, 1)

    expect(nextConfig.map((group) => group.category)).toEqual(['工具', '服务'])
    expect(nextConfig[1].items.map((item) => item.slug)).toEqual(['alpha', 'beta'])
  })

  it('moves bookmarks within the same group', () => {
    const nextConfig = moveService(sampleConfig, { groupIndex: 0, serviceIndex: 0 }, 0, 2)

    expect(nextConfig[0].items.map((item) => item.slug)).toEqual(['beta', 'alpha'])
  })

  it('moves bookmarks across groups', () => {
    const nextConfig = moveService(sampleConfig, { groupIndex: 0, serviceIndex: 1 }, 1, 1)

    expect(nextConfig[0].items.map((item) => item.slug)).toEqual(['alpha'])
    expect(nextConfig[1].items.map((item) => item.slug)).toEqual(['gamma', 'beta'])
  })
})

describe('validateBookmarkForm', () => {
  it('creates first group payload when no groups exist', () => {
    const result = validateBookmarkForm(
      {
        groupIndex: '',
        newGroupName: '  常用  ',
        name: '新书签',
        slug: 'new-item',
        icon: '',
        primaryUrl: 'http://127.0.0.1:8080',
        secondaryUrl: 'https://example.com',
        probesText: 'https://example.com/health',
      },
      []
    )

    expect(result.newGroupName).toBe('常用')
    expect(result.targetGroupIndex).toBe(0)
    expect(result.service.slug).toBe('new-item')
    expect(result.service.probes).toEqual(['https://example.com/health'])
  })

  it('rejects duplicate bookmark slugs', () => {
    expect(() =>
      validateBookmarkForm(
        {
          groupIndex: '0',
          newGroupName: '',
          name: '重复',
          slug: 'alpha',
          icon: '',
          primaryUrl: 'http://127.0.0.1:8080',
          secondaryUrl: 'https://example.com',
          probesText: '',
        },
        sampleConfig
      )
    ).toThrow('书签标识“alpha”已存在')
  })
})
