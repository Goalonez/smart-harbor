import { useQuery } from '@tanstack/react-query'
import { fetchWebdavBackupVersions, webdavBackupVersionsQueryKey } from './api'

export function useWebdavBackupVersions(enabled: boolean) {
  return useQuery({
    queryKey: webdavBackupVersionsQueryKey,
    queryFn: fetchWebdavBackupVersions,
    staleTime: 30_000,
    enabled,
  })
}
