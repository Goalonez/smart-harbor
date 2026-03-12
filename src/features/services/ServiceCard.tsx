import type { HTMLAttributes } from 'react'
import { Card } from '@/components/ui/card'
import { useSystemConfig } from '@/features/config/useSystemConfig'
import { defaultSystemConfig } from '@/features/config/api'
import { resolveTargetUrl } from '@/core/navigation/resolveTargetUrl'
import { openWithFallback } from '@/core/navigation/openWithFallback'
import { useAppStore } from '@/store/appStore'
import type { OpenTarget, Service } from '@/config/schema'
import { cn } from '@/lib/utils'
import { ServiceIcon } from './ServiceIcon'

interface ServiceCardProps extends HTMLAttributes<HTMLDivElement> {
  service: Service
  isDragging?: boolean
  isDropTarget?: boolean
}

export function ServiceCard({
  service,
  className,
  isDragging,
  isDropTarget,
  onClick,
  onMouseDown,
  ...props
}: ServiceCardProps) {
  const networkMode = useAppStore((state) => state.networkMode)
  const { data: systemConfig } = useSystemConfig()
  const activeSystemConfig = systemConfig ?? defaultSystemConfig

  async function openService(target: OpenTarget) {
    const urls = resolveTargetUrl(service, networkMode)
    await openWithFallback(urls, { target })
  }

  const handleClick: HTMLAttributes<HTMLDivElement>['onClick'] = async (event) => {
    onClick?.(event)

    if (event?.defaultPrevented) {
      return
    }

    await openService(activeSystemConfig.clickOpenTarget)
  }

  const handleMouseDown: HTMLAttributes<HTMLDivElement>['onMouseDown'] = (event) => {
    onMouseDown?.(event)

    if (event.defaultPrevented || event.button !== 1) {
      return
    }

    event.preventDefault()
    void openService(activeSystemConfig.middleClickOpenTarget)
  }

  return (
    <Card
      className={cn(
        'group h-full cursor-pointer rounded-lg border border-border/85 bg-card/92 px-2 py-1.5 shadow-[0_10px_24px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-primary/25 hover:bg-card hover:shadow-[0_12px_28px_rgba(15,23,42,0.12)] dark:bg-card/82 dark:shadow-[0_12px_28px_rgba(0,0,0,0.26)] dark:hover:shadow-[0_14px_30px_rgba(0,0,0,0.32)]',
        isDragging && 'cursor-grabbing opacity-45 shadow-none',
        isDropTarget && 'border-primary/50 ring-2 ring-primary/20',
        className
      )}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      {...props}
    >
      <div className="grid min-h-[58px] grid-cols-[auto_minmax(0,1fr)] items-center gap-1.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border/75 bg-background/85 text-primary/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] transition-transform duration-300 group-hover:scale-[1.04]">
          <ServiceIcon name={service.icon} className="h-3.5 w-3.5" />
        </div>
        <div className="flex min-h-[1.875rem] min-w-0 items-center justify-start pr-1">
          <div className="w-full min-w-0 text-left text-[12.5px] font-medium leading-[1.25] text-foreground sm:text-[13px] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden break-normal">
            {service.name}
          </div>
        </div>
      </div>
    </Card>
  )
}
