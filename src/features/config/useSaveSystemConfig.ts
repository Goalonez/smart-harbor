import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { AppConfig, SystemConfig } from '@/config/schema'
import { appConfigQueryKey, saveSystemConfig, systemConfigQueryKey } from '@/features/config/api'

export function useSaveSystemConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (config: SystemConfig) => saveSystemConfig(config),
    onSuccess: (savedConfig) => {
      queryClient.setQueryData(systemConfigQueryKey, savedConfig)
      queryClient.setQueryData(appConfigQueryKey, (currentConfig: AppConfig | undefined) => {
        if (!currentConfig) {
          return currentConfig
        }

        return {
          ...currentConfig,
          system: savedConfig,
        }
      })
    },
  })
}
