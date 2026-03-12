import { defaultSystemConfig } from '@/config/defaultConfig'
import { appConfigSchema, systemConfigSchema, type AppConfig, type ServicesConfig, type SystemConfig } from '@/config/schema'
import { getCurrentMessages } from '@/i18n/runtime'
import { defaultAppConfig, parseAppConfig } from '@/features/config/appConfig'
import { defaultServicesConfig, parseServicesConfig } from '@/features/services/servicesConfig'

export { defaultSystemConfig }

export const appConfigQueryKey = ['config', 'app'] as const
export const servicesConfigQueryKey = ['config', 'services'] as const
export const systemConfigQueryKey = ['config', 'system'] as const

export interface ApiRequestOptions extends RequestInit {
  fallbackMessage?: string
}

export async function requestJson<T>(url: string, options?: ApiRequestOptions): Promise<T> {
  const messages = getCurrentMessages()
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers ?? {}),
    },
    ...options,
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || options?.fallbackMessage || messages.common.requestFailed)
  }

  return response.json() as Promise<T>
}

function isNetworkError(error: unknown) {
  return error instanceof TypeError
}

export async function fetchAppConfig(): Promise<AppConfig> {
  const messages = getCurrentMessages()

  try {
    const data = await requestJson<unknown>('/api/config/app', {
      fallbackMessage: messages.errors.loadAppConfigFailed,
    })
    return parseAppConfig(data)
  } catch (error) {
    if (isNetworkError(error)) {
      return defaultAppConfig
    }
    throw error
  }
}

export async function saveAppConfig(config: AppConfig): Promise<AppConfig> {
  const messages = getCurrentMessages()
  const data = await requestJson<unknown>('/api/config/app', {
    method: 'PUT',
    body: JSON.stringify(config),
    fallbackMessage: messages.errors.saveAppConfigFailed,
  })
  return appConfigSchema.parse(parseAppConfig(data))
}

export async function fetchServicesConfig(): Promise<ServicesConfig> {
  const messages = getCurrentMessages()

  try {
    const data = await requestJson<unknown>('/api/config/services', {
      fallbackMessage: messages.errors.loadServicesConfigFailed,
    })
    return parseServicesConfig(data)
  } catch (error) {
    if (isNetworkError(error)) {
      return defaultServicesConfig
    }
    throw error
  }
}

export async function saveServicesConfig(config: ServicesConfig): Promise<ServicesConfig> {
  const messages = getCurrentMessages()
  const data = await requestJson<unknown>('/api/config/services', {
    method: 'PUT',
    body: JSON.stringify(config),
    fallbackMessage: messages.errors.saveServicesConfigFailed,
  })
  return parseServicesConfig(data)
}

export async function fetchSystemConfig(): Promise<SystemConfig> {
  const messages = getCurrentMessages()

  try {
    const data = await requestJson<unknown>('/api/config/system', {
      fallbackMessage: messages.errors.loadSystemConfigFailed,
    })
    return systemConfigSchema.parse(data)
  } catch (error) {
    if (isNetworkError(error)) {
      return defaultSystemConfig
    }
    throw error
  }
}

export async function saveSystemConfig(config: SystemConfig): Promise<SystemConfig> {
  const messages = getCurrentMessages()
  const data = await requestJson<unknown>('/api/config/system', {
    method: 'PUT',
    body: JSON.stringify(config),
    fallbackMessage: messages.errors.saveSystemConfigFailed,
  })
  return systemConfigSchema.parse(data)
}
