import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AppConfig } from '@/config/schema'
import {
  appConfigQueryKey,
  saveAppConfig,
  servicesConfigQueryKey,
  systemConfigQueryKey,
} from '@/features/config/api'

export function useSaveAppConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (config: AppConfig) => saveAppConfig(config),
    onSuccess: (savedConfig) => {
      queryClient.setQueryData(appConfigQueryKey, savedConfig)
      queryClient.setQueryData(systemConfigQueryKey, savedConfig.system)
      queryClient.setQueryData(servicesConfigQueryKey, savedConfig.services)
    },
  })
}
