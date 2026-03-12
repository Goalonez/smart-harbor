import { useQuery } from '@tanstack/react-query'
import { fetchSystemConfig, systemConfigQueryKey } from './api'

export function useSystemConfig() {
  return useQuery({
    queryKey: systemConfigQueryKey,
    queryFn: fetchSystemConfig,
    staleTime: 60_000,
  })
}
