import configData from '@/config/config.json'
import { appConfigSchema, servicesConfigSchema, systemConfigSchema } from '@/config/schema'

export const bundledAppConfig = appConfigSchema.parse(configData)
export const defaultSystemConfig = systemConfigSchema.parse({
  appName: bundledAppConfig.system.appName,
})
export const defaultServicesConfig = servicesConfigSchema.parse([])
export const defaultAppConfig = appConfigSchema.parse({
  system: defaultSystemConfig,
  services: defaultServicesConfig,
})
