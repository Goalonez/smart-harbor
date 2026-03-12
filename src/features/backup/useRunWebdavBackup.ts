import { useMutation, useQueryClient } from '@tanstack/react-query'
import { runWebdavBackup, webdavBackupVersionsQueryKey } from './api'

export function useRunWebdavBackup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: runWebdavBackup,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: webdavBackupVersionsQueryKey,
      })
    },
  })
}
