import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  appConfigQueryKey,
  servicesConfigQueryKey,
  systemConfigQueryKey,
} from '@/features/config/api'
import { restoreWebdavBackup, webdavBackupVersionsQueryKey } from './api'

export function useRestoreWebdavBackup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (versionId: string) => restoreWebdavBackup(versionId),
    onSuccess: async (result) => {
      queryClient.setQueryData(appConfigQueryKey, result.restoredConfig)
      queryClient.setQueryData(systemConfigQueryKey, result.restoredConfig.system)
      queryClient.setQueryData(servicesConfigQueryKey, result.restoredConfig.services)
      await queryClient.invalidateQueries({
        queryKey: webdavBackupVersionsQueryKey,
      })
    },
  })
}
