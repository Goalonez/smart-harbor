import type { KeyboardEvent } from 'react'
import { CornerDownLeft, Search } from 'lucide-react'
import { buildSearchUrl, getDefaultSearchEngine } from '@/config/searchEngines'
import { resolveTargetUrl } from '@/core/navigation/resolveTargetUrl'
import { resolveDirectUrl } from '@/core/navigation/resolveDirectUrl'
import { openWithFallback } from '@/core/navigation/openWithFallback'
import { defaultSystemConfig } from '@/features/config/api'
import { useSystemConfig } from '@/features/config/useSystemConfig'
import { useServices } from '@/features/services/useServices'
import { Input } from '@/components/ui/input'
import { getLocalizedSearchEngineName } from '@/i18n/messages'
import { useI18n } from '@/i18n/runtime'
import { useAppStore } from '@/store/appStore'

export function SearchBox() {
  const { services, isLoading } = useServices()
  const { data: systemConfig } = useSystemConfig()
  const networkMode = useAppStore((state) => state.networkMode)
  const searchKeyword = useAppStore((state) => state.searchKeyword)
  const setSearchKeyword = useAppStore((state) => state.setSearchKeyword)
  const { language, messages } = useI18n()

  const trimmedKeyword = searchKeyword.trim()
  const activeSystemConfig = systemConfig ?? defaultSystemConfig
  const defaultSearchEngine = getDefaultSearchEngine(
    activeSystemConfig.defaultSearchEngine,
    activeSystemConfig.customSearchEngines
  )
  const defaultSearchEngineName = getLocalizedSearchEngineName(language, defaultSearchEngine)

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing || trimmedKeyword.length === 0) {
      return
    }

    event.preventDefault()

    const directUrl = resolveDirectUrl(trimmedKeyword)
    if (directUrl) {
      void openWithFallback({ primary: directUrl }, { target: activeSystemConfig.clickOpenTarget })
      return
    }

    if (services.length === 1) {
      const service = services[0]
      const urls = resolveTargetUrl(service, networkMode)
      const openTarget = service.forceNewTab ? 'blank' : activeSystemConfig.clickOpenTarget
      void openWithFallback(urls, { target: openTarget })
      return
    }

    if (!isLoading && services.length === 0) {
      window.location.assign(buildSearchUrl(defaultSearchEngine, trimmedKeyword))
    }
  }

  return (
    <div className="group relative mx-auto w-full max-w-[46rem]">
      <div className="relative rounded-[1.2rem] border border-border/75 bg-background/92 p-1.25 shadow-[0_12px_24px_rgba(15,23,42,0.06)] transition-all duration-200 group-focus-within:border-primary/40 group-focus-within:shadow-[0_0_0_5px_hsl(var(--ring)/0.14),0_18px_40px_rgba(15,23,42,0.1)] dark:bg-background/72 dark:shadow-[0_18px_32px_rgba(0,0,0,0.24)] dark:group-focus-within:shadow-[0_0_0_5px_hsl(var(--ring)/0.2),0_22px_42px_rgba(0,0,0,0.3)]">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70 transition-colors duration-200 group-focus-within:text-primary" />
        <span
          title={defaultSearchEngineName}
          className="pointer-events-none absolute left-9 top-1/2 inline-flex max-w-[6.5rem] -translate-y-1/2 items-center justify-center truncate rounded-full border border-border/70 bg-background/92 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground shadow-sm sm:max-w-[7rem]"
        >
          {defaultSearchEngineName}
        </span>
        <Input
          autoFocus
          type="text"
          enterKeyHint="search"
          placeholder={messages.common.searchPlaceholder}
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-9 rounded-[0.95rem] border-transparent bg-transparent pl-[6.8rem] pr-10 text-[13px] shadow-none placeholder:text-muted-foreground/68 focus-visible:border-transparent focus-visible:ring-0 focus-visible:ring-offset-0 sm:h-[2.625rem] sm:pl-[7.45rem] sm:text-[13.5px]"
        />
        <span className="pointer-events-none absolute right-2.5 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded-full border border-border/70 bg-background/92 px-2 py-0.5 text-[10px] font-medium text-muted-foreground shadow-sm">
          <CornerDownLeft className="h-3 w-3" />
          <span className="hidden sm:inline">Enter</span>
        </span>
      </div>
    </div>
  )
}
