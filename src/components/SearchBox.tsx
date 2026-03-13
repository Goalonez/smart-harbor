import type { KeyboardEvent } from 'react'
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
    <div className="relative mx-auto w-full max-w-lg">
      <span
        title={defaultSearchEngineName}
        className="pointer-events-none absolute left-3 top-1/2 inline-flex max-w-[5.5rem] -translate-y-1/2 items-center justify-center truncate rounded-md border border-white/10 bg-white/10 px-2 py-1 text-[11px] font-medium text-muted-foreground"
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
        className="h-10 rounded-lg border border-input/80 bg-background/60 pl-28 pr-12 text-sm backdrop-blur-md placeholder:text-muted-foreground/70 focus-visible:ring-offset-0"
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-white/10 bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
        ↵
      </span>
    </div>
  )
}
