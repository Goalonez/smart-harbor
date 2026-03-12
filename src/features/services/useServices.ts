import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getCurrentMessages } from '@/i18n/runtime'
import { useAppStore } from '@/store/appStore'
import { fetchServicesConfig, servicesConfigQueryKey } from '@/features/config/api'
import { normalizeServicesConfig } from '@/features/services/servicesConfig'

export function useServicesConfig() {
  const setError = useAppStore((state) => state.setError)

  return useQuery({
    queryKey: servicesConfigQueryKey,
    queryFn: async () => {
      try {
        const config = await fetchServicesConfig()
        setError(null)
        return config
      } catch (error) {
        const fallbackMessage = getCurrentMessages().common.invalidContentRetry
        const errorMessage = error instanceof Error ? error.message : fallbackMessage
        setError(errorMessage)
        throw error
      }
    },
    staleTime: 30_000,
  })
}

export function useServices() {
  const searchKeyword = useAppStore((state) => state.searchKeyword)
  const query = useServicesConfig()

  const keyword = searchKeyword.trim().toLowerCase()

  const allGroupedServices = useMemo(() => {
    if (!query.data) {
      return []
    }

    return normalizeServicesConfig(query.data)
  }, [query.data])

  const groupedServices = useMemo(() => {
    return allGroupedServices
      .map((group) => {
        const matchCategory = keyword ? group.category.toLowerCase().includes(keyword) : false
        const services = keyword
          ? group.services.filter((service) => {
              if (matchCategory) {
                return true
              }

              return (
                service.name.toLowerCase().includes(keyword) ||
                service.slug.toLowerCase().includes(keyword)
              )
            })
          : group.services

        return {
          category: group.category,
          services,
        }
      })
      .filter((group) => (keyword ? group.services.length > 0 : true))
  }, [allGroupedServices, keyword])

  const allServices = allGroupedServices.flatMap((group) => group.services)

  return {
    services: groupedServices.flatMap((group) => group.services),
    allServices,
    groupedServices,
    config: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}
