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
        'grid min-h-[540px] flex-1 overflow-hidden md:grid-cols-[188px_minmax(0,1fr)]',
        className
      )}
    >
      <aside className="min-w-0 border-b border-border/70 bg-muted/18 p-2 md:border-b-0 md:border-r md:p-3">
        <p className="mb-2 hidden text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground md:block">
          {panelTitle}
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1 pr-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:block md:space-y-2 md:overflow-visible md:pb-0 md:pr-0">
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
                  'flex min-w-[124px] shrink-0 items-center gap-2 whitespace-normal rounded-xl border px-3 py-2 text-left transition md:w-full md:min-w-0 md:items-start md:gap-2.5 md:px-2.5 md:py-2.5',
                  isActive
                    ? 'border-primary/30 bg-primary/10 text-primary'
                    : 'border-border/70 bg-background/80 text-foreground hover:border-primary/20 hover:bg-accent'
                )}
              >
                <span className="rounded-lg border border-current/20 bg-background/70 p-1.5">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-medium">{item.label}</span>
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
      <div className="border-b border-border/70 px-4 py-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
            <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{summary}</p>
          </div>
          {headerActions ? <div className="flex flex-wrap gap-2">{headerActions}</div> : null}
        </div>
      </div>

      <div className={cn('flex-1 overflow-y-auto px-4 py-3', bodyClassName)}>{children}</div>

      {footer ? (
        <div className="flex flex-col gap-2 border-t border-border/70 px-4 py-3 md:flex-row md:items-center md:justify-between">
          {footer}
        </div>
      ) : null}
    </section>
  )
}
