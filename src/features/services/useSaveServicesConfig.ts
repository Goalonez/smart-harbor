import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AppConfig, ServicesConfig } from '@/config/schema'
import {
  appConfigQueryKey,
  servicesConfigQueryKey,
  saveServicesConfig,
} from '@/features/config/api'

export function useSaveServicesConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (config: ServicesConfig) => saveServicesConfig(config),
    onSuccess: (savedConfig) => {
      queryClient.setQueryData(servicesConfigQueryKey, savedConfig)
      queryClient.setQueryData(appConfigQueryKey, (currentConfig: AppConfig | undefined) => {
        if (!currentConfig) {
          return currentConfig
        }

        return {
          ...currentConfig,
          services: savedConfig,
        }
      })
    },
  })
}
