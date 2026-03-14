import { useEffect, useRef, useState } from 'react'
import { ChevronDown, HelpCircle, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LazyBookmarkManageButton } from './LazyBookmarkManageButton'
import { LazyServiceSettingsButton } from './LazyServiceSettingsButton'
import { useI18n } from '@/i18n/runtime'
import { useSystemConfig } from '@/features/config/useSystemConfig'
import { useAppStore } from '@/store/appStore'

const REPOSITORY_URL = 'https://github.com/Goalonez/smart-harbor'

function GitHubMarkIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="h-4.5 w-4.5">
      <path
        fill="currentColor"
        d="M12 .5C5.65.5.5 5.66.5 12.02c0 5.09 3.3 9.4 7.88 10.92.58.11.8-.25.8-.57v-2.02c-3.2.69-3.88-1.36-3.88-1.36-.52-1.34-1.28-1.69-1.28-1.69-1.04-.72.08-.71.08-.71 1.15.08 1.75 1.19 1.75 1.19 1.02 1.76 2.68 1.25 3.33.95.1-.74.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.47.11-3.06 0 0 .97-.31 3.17 1.18a10.97 10.97 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.59.23 2.77.11 3.06.73.81 1.18 1.84 1.18 3.1 0 4.42-2.68 5.39-5.24 5.67.41.36.77 1.06.77 2.15v3.19c0 .31.21.68.81.57a11.53 11.53 0 0 0 7.87-10.92C23.5 5.66 18.35.5 12 .5Z"
      />
    </svg>
  )
}

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
    <div className="sticky top-0 z-50 px-3 pt-2 sm:px-4 sm:pt-3">
      <div className="container mx-auto flex h-[3.6rem] max-w-[92rem] items-center justify-between gap-3 rounded-[1.2rem] border border-border/75 bg-background/84 px-3.5 shadow-[0_14px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/66 sm:px-4 dark:shadow-[0_18px_40px_rgba(0,0,0,0.26)]">
        <div className="flex min-w-0 shrink items-center gap-2 sm:gap-3">
          <div className="hidden h-8 w-8 items-center justify-center rounded-xl border border-primary/20 bg-primary/12 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.22)] sm:flex">
            <Wifi className="h-3.5 w-3.5" />
          </div>
          <h1 className="truncate whitespace-nowrap font-display text-[15px] font-semibold tracking-tight sm:text-base">
            <span className="sm:hidden">Smart Harbor</span>
            <span className="hidden sm:inline">{systemConfig?.appName ?? 'Smart Harbor'}</span>
          </h1>
          <div className="relative" ref={networkInfoRef}>
            <button
              type="button"
              aria-expanded={isNetworkInfoOpen}
              aria-haspopup="dialog"
              aria-label={messages.topBar.networkInfo.buttonAria}
              title={messages.topBar.networkInfo.buttonAria}
              onClick={() => setIsNetworkInfoOpen((open) => !open)}
              className={`inline-flex min-h-8 items-center gap-1 whitespace-nowrap rounded-full border px-2 py-1 text-[10px] font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-accent/60 sm:min-h-9 sm:gap-1.5 sm:px-3 sm:text-xs ${networkBadgeClass}`}
            >
              <NetworkIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="hidden md:inline">{messages.topBar.network}</span>
              <span className="hidden md:inline text-current/70">·</span>
              <span>{networkLabel}</span>
              <ChevronDown
                className={`h-3 w-3 transition-transform sm:h-3.5 sm:w-3.5 ${isNetworkInfoOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {isNetworkInfoOpen && (
              <div
                role="dialog"
                aria-label={messages.topBar.networkInfo.title}
                className="fixed top-[4.5rem] right-3 left-3 z-[100] max-h-[calc(100vh-5.25rem)] overflow-y-auto rounded-[1.2rem] border border-stone-200/90 bg-stone-50 p-4 text-left shadow-[0_24px_60px_rgba(15,23,42,0.22)] ring-1 ring-stone-900/5 backdrop-blur-xl sm:absolute sm:top-full sm:right-auto sm:left-0 sm:mt-2.5 sm:w-[22rem] sm:max-h-[min(28rem,calc(100vh-7rem))] dark:border-stone-700/80 dark:bg-stone-950 dark:ring-white/10 dark:shadow-[0_28px_70px_rgba(0,0,0,0.5)]"
              >
                <div
                  aria-hidden="true"
                  className="absolute -top-1.5 left-4 hidden h-3 w-3 rotate-45 border-t border-l border-stone-200/90 bg-stone-50 sm:block dark:border-stone-700/80 dark:bg-stone-950"
                />
                <p className="text-sm font-semibold text-foreground">
                  {messages.topBar.networkInfo.title}
                </p>
                <p className="mt-1.5 text-xs leading-5 text-muted-foreground">
                  {messages.topBar.networkInfo.summary}
                </p>
                <div className="mt-3 rounded-xl border border-border/70 bg-stone-100/90 px-3 py-2 text-xs text-foreground dark:bg-stone-900/88">
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

        <div className="flex shrink-0 items-center gap-2">
          <LazyBookmarkManageButton />
          <LazyServiceSettingsButton />
          <Button
            asChild
            variant="outline"
            size="icon"
            className="hidden h-10 w-10 rounded-full sm:inline-flex"
          >
            <a
              href={REPOSITORY_URL}
              target="_blank"
              rel="noreferrer"
              aria-label={messages.topBar.githubButtonAria}
              title={messages.topBar.githubButtonAria}
            >
              <GitHubMarkIcon />
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}
