// @vitest-environment node

import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { AppConfig, ServicesConfig, SystemConfig } from '../src/config/schema.js'

let tempConfigDir = ''

async function loadConfigStore() {
  vi.resetModules()
  process.env.CONFIG_DIR = tempConfigDir
  return import('./configStore.js')
}

describe('configStore', () => {
  beforeEach(async () => {
    tempConfigDir = await mkdtemp(path.join(os.tmpdir(), 'smart-harbor-config-'))
  })

  afterEach(async () => {
    delete process.env.CONFIG_DIR
    if (tempConfigDir) {
      await rm(tempConfigDir, { recursive: true, force: true })
    }
  })

  it('migrates legacy services and system files into config.json', async () => {
    const legacyServices: ServicesConfig = [
      {
        category: '测试',
        items: [
          {
            slug: 'demo',
            name: 'Demo',
            primaryUrl: 'http://127.0.0.1:3000',
            secondaryUrl: 'https://demo.example.com',
          },
        ],
      },
    ]
    const legacySystem: SystemConfig = {
      appName: 'Migrated Harbor',
      darkMode: true,
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
    }

    await writeFile(
      path.join(tempConfigDir, 'services.json'),
      `${JSON.stringify(legacyServices, null, 2)}\n`,
      'utf8'
    )
    await writeFile(
      path.join(tempConfigDir, 'system.json'),
      `${JSON.stringify(legacySystem, null, 2)}\n`,
      'utf8'
    )

    const configStore = await loadConfigStore()
    const services = await configStore.readServicesConfig()
    const system = await configStore.readSystemConfig()
    const storedConfig = JSON.parse(
      await readFile(path.join(tempConfigDir, 'config.json'), 'utf8')
    ) as {
      services: ServicesConfig
      system: SystemConfig
    }

    expect(services).toEqual(legacyServices)
    expect(system).toEqual(legacySystem)
    expect(storedConfig.services).toEqual(legacyServices)
    expect(storedConfig.system).toEqual(legacySystem)
  })

  it('preserves the other section when updating a single config section', async () => {
    const nextSystem: SystemConfig = {
      appName: 'Single File Harbor',
      darkMode: true,
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
    }
    const nextServices: ServicesConfig = [
      {
        category: '工具',
        items: [
          {
            slug: 'toolbox',
            name: 'Toolbox',
            primaryUrl: 'http://127.0.0.1:4000',
            secondaryUrl: 'https://toolbox.example.com',
          },
        ],
      },
    ]

    const configStore = await loadConfigStore()
    await configStore.writeSystemConfig(nextSystem)
    await configStore.writeServicesConfig(nextServices)

    const storedConfig = JSON.parse(
      await readFile(path.join(tempConfigDir, 'config.json'), 'utf8')
    ) as {
      services: ServicesConfig
      system: SystemConfig
    }

    expect(storedConfig.system).toEqual(nextSystem)
    expect(storedConfig.services).toEqual(nextServices)
  })

  it('treats an empty config.json as defaults instead of failing', async () => {
    await writeFile(path.join(tempConfigDir, 'config.json'), '   \n', 'utf8')

    const configStore = await loadConfigStore()
    const config = await configStore.readAppConfig()

    expect(config).toEqual({
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
    } satisfies AppConfig)
  })

  it('fills missing config sections with defaults while keeping existing values', async () => {
    await writeFile(
      path.join(tempConfigDir, 'config.json'),
      `${JSON.stringify(
        {
          system: {
            appName: 'Partial Harbor',
          },
        },
        null,
        2
      )}\n`,
      'utf8'
    )

    const configStore = await loadConfigStore()
    const config = await configStore.readAppConfig()

    expect(config).toEqual({
      system: {
        appName: 'Partial Harbor',
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
    } satisfies AppConfig)
  })

  it('creates a default empty config when no file exists', async () => {
    const configStore = await loadConfigStore()
    const config = await configStore.readAppConfig()

    expect(config).toEqual({
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
    } satisfies AppConfig)
  })
})
