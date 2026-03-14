import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ConfigPanelTab<Key extends string> {
  key: Key
  label: string
  description: string
  icon: LucideIcon
}

interface ConfigPanelLayoutProps<Key extends string> {
  panelTitle: string
  tabs: readonly ConfigPanelTab<Key>[]
  activeTab: Key
  onTabChange: (key: Key) => void
  children: ReactNode
  className?: string
}

interface ConfigPanelSectionProps {
  title: string
  summary: string
  headerActions?: ReactNode
  footer?: ReactNode
  bodyClassName?: string
  children: ReactNode
}

export function ConfigPanelLayout<Key extends string>({
  panelTitle,
  tabs,
  activeTab,
  onTabChange,
  children,
  className,
}: ConfigPanelLayoutProps<Key>) {
  return (
    <div
      className={cn(
        'config-panel-shell grid min-h-0 flex-1 overflow-hidden md:min-h-[36rem] md:grid-cols-[230px_minmax(0,1fr)]',
        className
      )}
    >
      <aside className="min-w-0 border-b border-border/65 bg-[linear-gradient(180deg,hsl(var(--background)/0.82),hsl(var(--muted)/0.28))] p-2 md:border-r md:border-b-0 md:p-4">
        <p className="mb-3 hidden text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground md:block">
          {panelTitle}
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 pr-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:block md:space-y-2.5 md:overflow-visible md:pb-0 md:pr-0">
          {tabs.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.key

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onTabChange(item.key)}
                aria-pressed={isActive}
                className={cn(
                  'flex min-h-9 min-w-[106px] shrink-0 items-center gap-1.5 whitespace-normal rounded-[0.9rem] border px-2 py-1.5 text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.16)] transition-all duration-200 md:w-full md:min-h-10 md:min-w-0 md:items-start md:gap-3 md:rounded-[0.95rem] md:px-3 md:py-3',
                  isActive
                    ? 'border-primary/30 bg-primary/12 text-primary shadow-[0_14px_32px_hsl(var(--primary)/0.12)]'
                    : 'border-border/70 bg-background/78 text-foreground hover:-translate-y-0.5 hover:border-primary/20 hover:bg-accent/75'
                )}
              >
                <span className="rounded-[0.8rem] border border-current/15 bg-background/82 p-1 shadow-sm md:rounded-xl md:p-1.5">
                  <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[12px] font-medium leading-4 md:text-[13px]">
                    {item.label}
                  </span>
                  <span className="mt-0.5 hidden text-[11px] leading-5 text-muted-foreground md:block">
                    {item.description}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </aside>

      {children}
    </div>
  )
}

export function ConfigPanelSection({
  title,
  summary,
  headerActions,
  footer,
  bodyClassName,
  children,
}: ConfigPanelSectionProps) {
  return (
    <section className="flex min-h-0 flex-col overflow-hidden">
      <div className="border-b border-border/65 bg-[linear-gradient(180deg,hsl(var(--background)/0.78),hsl(var(--background)/0.6))] px-3.5 py-3 backdrop-blur-sm sm:px-5 sm:py-4">
        <div className="flex flex-wrap items-start justify-between gap-2.5 sm:gap-3">
          <div>
            <h3 className="text-[15px] font-semibold text-foreground sm:text-base">{title}</h3>
            <p className="mt-1 text-[11px] leading-[1.35rem] text-muted-foreground sm:text-xs sm:leading-5">
              {summary}
            </p>
          </div>
          {headerActions ? (
            <div className="flex w-full flex-wrap gap-1.5 sm:w-auto sm:gap-2 [&_button]:h-8 [&_button]:rounded-lg [&_button]:px-2.5 [&_button]:text-[11px] [&_button_svg]:size-3.5 sm:[&_button]:h-10 sm:[&_button]:rounded-xl sm:[&_button]:px-3.5 sm:[&_button]:text-sm sm:[&_button_svg]:size-4">
              {headerActions}
            </div>
          ) : null}
        </div>
      </div>

      <div
        className={cn(
          'config-scroll min-h-0 flex-1 overflow-y-auto px-3.5 py-3 sm:px-5 sm:py-5',
          bodyClassName
        )}
      >
        {children}
      </div>

      {footer ? (
        <div className="flex flex-col gap-2.5 border-t border-border/65 bg-[linear-gradient(180deg,hsl(var(--background)/0.72),hsl(var(--background)/0.56))] px-3.5 py-3 backdrop-blur-sm sm:px-5 sm:py-4 md:flex-row md:items-center md:justify-between">
          {footer}
        </div>
      ) : null}
    </section>
  )
}
