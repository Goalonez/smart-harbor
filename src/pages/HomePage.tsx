import { useEffect } from 'react'
import { HeroClock } from '@/components/HeroClock'
import { SearchBox } from '@/components/SearchBox'
import { TopBar } from '@/components/TopBar'
import { ServiceGrid } from '@/features/services/ServiceGrid'
import { useI18n } from '@/i18n/runtime'
import { useAppStore } from '@/store/appStore'
import { useServices } from '@/features/services/useServices'
import { detectNetworkMode } from '@/core/network/detectNetworkMode'

export function HomePage() {
  const setNetworkMode = useAppStore((state) => state.setNetworkMode)
  const error = useAppStore((state) => state.error)
  const { allServices } = useServices()
  const { messages } = useI18n()

  useEffect(() => {
    let cancelled = false

    if (allServices.length === 0) {
      setNetworkMode('unknown')
      return () => {
        cancelled = true
      }
    }

    void detectNetworkMode(allServices).then((mode) => {
      if (!cancelled) {
        setNetworkMode(mode)
      }
    })

    return () => {
      cancelled = true
    }
  }, [allServices, setNetworkMode])

  return (
    <div className="min-h-screen bg-background">
      <TopBar />
      <main className="container mx-auto px-5 pt-3 pb-5 md:px-8 md:pt-4 md:pb-6 lg:px-10">
        <section className="mx-auto flex max-w-xl flex-col items-center py-3 text-center md:py-4">
          <HeroClock />
          <div className="mt-3.5 w-full animate-slide-up [animation-delay:220ms]">
            <SearchBox />
          </div>
        </section>

        {error && (
          <div className="mx-auto mb-8 max-w-2xl rounded-xl border border-red-200 bg-red-50 p-6 md:p-8">
            <p className="text-lg font-semibold text-red-900">{messages.home.errorTitle}</p>
            <p className="mt-1 text-sm leading-relaxed text-red-700">{error}</p>
          </div>
        )}

        <div className="mt-4">
          <ServiceGrid />
        </div>
      </main>
    </div>
  )
}
