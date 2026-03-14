import { useEffect, useSyncExternalStore, type ComponentType } from 'react'
import { Box } from 'lucide-react'
import {
  getCachedIconComponent,
  getIconCacheSnapshot,
  loadIconComponent,
  notifyIconLoaded,
  resolveIconLoaderKey,
  subscribeIconCache,
} from './iconRegistry'

interface ServiceIconProps {
  name?: string
  className?: string
  autoLoad?: boolean
}

type IconComponent = ComponentType<{
  className?: string
}>

export function ServiceIcon({ name, className, autoLoad = true }: ServiceIconProps) {
  const loaderKey = resolveIconLoaderKey(name)
  useSyncExternalStore(subscribeIconCache, getIconCacheSnapshot, getIconCacheSnapshot)

  useEffect(() => {
    if (!autoLoad || loaderKey === 'box' || getCachedIconComponent(loaderKey)) {
      return
    }

    let cancelled = false

    void loadIconComponent(loaderKey).then(() => {
      if (!cancelled) {
        notifyIconLoaded()
      }
    })

    return () => {
      cancelled = true
    }
  }, [autoLoad, loaderKey])

  const Icon: IconComponent = getCachedIconComponent(loaderKey) ?? Box

  return <Icon className={className} />
}
