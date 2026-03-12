import { defaultAppConfig as bundledDefaultAppConfig } from '@/config/defaultConfig'
import { appConfigSchema, systemConfigSchema, type AppConfig, type ServicesConfig, type SystemConfig } from '@/config/schema'
import { getCurrentMessages } from '@/i18n/runtime'
import { cloneServicesConfig, parseServicesConfig } from '@/features/services/servicesConfig'

export const defaultAppConfig = parseAppConfig(bundledDefaultAppConfig)

export function buildAppConfig(system: SystemConfig, services: ServicesConfig): AppConfig {
  return parseAppConfig({ system, services })
}

export function parseAppConfig(input: unknown): AppConfig {
  const messages = getCurrentMessages()
  let validated: AppConfig

  try {
    validated = appConfigSchema.parse(input)
  } catch {
    throw new Error(messages.common.invalidContentRetry)
  }

  return {
    system: systemConfigSchema.parse(validated.system),
    services: parseServicesConfig(validated.services),
  }
}

export function parseAppConfigText(input: string): AppConfig {
  const messages = getCurrentMessages()
  const trimmed = input.trim()

  try {
    return parseAppConfig(trimmed ? JSON.parse(trimmed) : undefined)
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(messages.common.invalidContentRetry)
    }

    throw error instanceof Error ? error : new Error(messages.common.invalidContentRetry)
  }
}

export function cloneAppConfig(config: AppConfig): AppConfig {
  return {
    system: {
      ...config.system,
      customSearchEngines: config.system.customSearchEngines.map((engine) => ({ ...engine })),
    },
    services: cloneServicesConfig(config.services),
  }
}

export function formatAppConfig(config: AppConfig) {
  return JSON.stringify(cloneAppConfig(parseAppConfig(config)), null, 2)
}
