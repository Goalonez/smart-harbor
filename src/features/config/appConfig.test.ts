import { describe, expect, it } from 'vitest'
import { parseAppConfig, parseAppConfigText } from '@/features/config/appConfig'

describe('appConfig helpers', () => {
  it('fills missing app config sections with defaults', () => {
    expect(parseAppConfig({})).toEqual({
      system: {
        appName: 'Smart Harbor',
        darkMode: false,
        clickOpenTarget: 'self',
        middleClickOpenTarget: 'blank',
        defaultSearchEngine: 'google',
        customSearchEngines: [],
        webdavBackup: {
          url: '',
          username: '',
          password: '',
          remotePath: '/smart-harbor',
          autoBackup: false,
          intervalDays: 7,
          maxVersions: 10,
        },
      },
      services: [],
    })
  })

  it('treats blank config text as defaults', () => {
    expect(parseAppConfigText('   ')).toEqual(parseAppConfig({}))
  })
})
