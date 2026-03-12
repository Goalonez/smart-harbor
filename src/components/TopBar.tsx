import { useEffect, useRef, useState } from 'react'
import { ChevronDown, HelpCircle, Wifi, WifiOff } from 'lucide-react'
import { LazyBookmarkManageButton } from './LazyBookmarkManageButton'
import { LazyServiceSettingsButton } from './LazyServiceSettingsButton'
import { useI18n } from '@/i18n/runtime'
import { useSystemConfig } from '@/features/config/useSystemConfig'
import { useAppStore } from '@/store/appStore'

export function TopBar() {
  const networkMode = useAppStore((state) => state.networkMode)
  const setTheme = useAppStore((state) => state.setTheme)
  const { data: systemConfig } = useSystemConfig()
  const { messages } = useI18n()
  const [isNetworkInfoOpen, setIsNetworkInfoOpen] = useState(false)
  const networkInfoRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setTheme(systemConfig?.darkMode ? 'dark' : 'light')
  }, [setTheme, systemConfig?.darkMode])

  useEffect(() => {
    document.title = `${systemConfig?.appName ?? 'Smart Harbor'} - ${messages.meta.pageTitleSuffix}`
  }, [messages.meta.pageTitleSuffix, systemConfig?.appName])

  useEffect(() => {
    if (!isNetworkInfoOpen) {
      return
    }

    function handlePointerDown(event: PointerEvent) {
      if (event.target instanceof Node && networkInfoRef.current?.contains(event.target)) {
        return
      }

      setIsNetworkInfoOpen(false)
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsNetworkInfoOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isNetworkInfoOpen])

  const NetworkIcon = {
    lan: Wifi,
    wan: WifiOff,
    unknown: HelpCircle,
  }[networkMode]

  const networkLabel = {
    lan: messages.topBar.networkMode.lan,
    wan: messages.topBar.networkMode.wan,
    unknown: messages.topBar.networkMode.unknown,
  }[networkMode]

  const networkBadgeClass = {
    lan: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    wan: 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400',
    unknown: 'border-border/70 bg-muted/60 text-muted-foreground',
  }[networkMode]

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <div className="flex shrink-0 items-center gap-3">
          <h1 className="whitespace-nowrap text-lg font-semibold tracking-tight sm:text-xl">
            {systemConfig?.appName ?? 'Smart Harbor'}
          </h1>
          <div className="relative" ref={networkInfoRef}>
            <button
              type="button"
              aria-expanded={isNetworkInfoOpen}
              aria-haspopup="dialog"
              aria-label={messages.topBar.networkInfo.buttonAria}
              title={messages.topBar.networkInfo.buttonAria}
              onClick={() => setIsNetworkInfoOpen((open) => !open)}
              className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-accent/60 ${networkBadgeClass}`}
            >
              <NetworkIcon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{messages.topBar.network}</span>
              <span className="hidden sm:inline text-current/70">·</span>
              <span>{networkLabel}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${isNetworkInfoOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isNetworkInfoOpen && (
              <div
                role="dialog"
                aria-label={messages.topBar.networkInfo.title}
                className="fixed top-[4.5rem] right-3 left-3 z-20 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl border border-border bg-background p-4 text-left shadow-2xl sm:absolute sm:top-full sm:right-auto sm:left-0 sm:mt-3 sm:w-[22rem] sm:max-h-[min(28rem,calc(100vh-7rem))]"
              >
                <div
                  aria-hidden="true"
                  className="absolute -top-1.5 left-4 hidden h-3 w-3 rotate-45 border-t border-l border-border bg-background sm:block"
                />
                <p className="text-sm font-semibold text-foreground">
                  {messages.topBar.networkInfo.title}
                </p>
                <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                  {messages.topBar.networkInfo.summary}
                </p>
                <div className="mt-3 rounded-xl bg-muted px-3 py-2 text-xs text-foreground">
                  <span className="text-muted-foreground">
                    {messages.topBar.networkInfo.currentMode}：
                  </span>
                  <span className="ml-1 font-medium">{networkLabel}</span>
                </div>
                <div className="mt-3 space-y-2.5 text-xs leading-5 text-muted-foreground">
                  <p>
                    <span className="font-medium text-foreground">
                      {messages.topBar.networkMode.lan}：
                    </span>
                    {messages.topBar.networkInfo.lanRule}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">
                      {messages.topBar.networkMode.wan}：
                    </span>
                    {messages.topBar.networkInfo.wanRule}
                  </p>
                  <p>
                    <span className="font-medium text-foreground">
                      {messages.topBar.networkMode.unknown}：
                    </span>
                    {messages.topBar.networkInfo.unknownRule}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <LazyBookmarkManageButton />
          <LazyServiceSettingsButton />
        </div>
      </div>
    </div>
  )
}
