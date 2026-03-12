import { useEffect, useState, type ComponentType } from 'react'
import { Box } from 'lucide-react'
import { loadServiceIcon, resolveDynamicIconName } from '@/features/services/icons'

interface ServiceIconProps {
  name?: string
  className?: string
}

type IconComponent = ComponentType<{
  className?: string
}>
type DynamicIconName = NonNullable<ReturnType<typeof resolveDynamicIconName>> | 'box'

const iconComponentCache = new Map<string, IconComponent>()
const iconPromiseCache = new Map<string, Promise<IconComponent>>()

function loadIconComponent(loaderKey: DynamicIconName) {
  const cachedComponent = iconComponentCache.get(loaderKey)
  if (cachedComponent) {
    return Promise.resolve(cachedComponent)
  }

  const cachedPromise = iconPromiseCache.get(loaderKey)
  if (cachedPromise) {
    return cachedPromise
  }

  const nextPromise = loadServiceIcon(loaderKey).then((module) => {
    const Icon = module.default
    iconComponentCache.set(loaderKey, Icon)
    iconPromiseCache.delete(loaderKey)
    return Icon
  })

  iconPromiseCache.set(loaderKey, nextPromise)
  return nextPromise
}

export function ServiceIcon({ name, className }: ServiceIconProps) {
  const loaderKey: DynamicIconName = resolveDynamicIconName(name) ?? 'box'
  const [Icon, setIcon] = useState<IconComponent>(() => iconComponentCache.get(loaderKey) ?? Box)

  useEffect(() => {
    let cancelled = false

    const cachedIcon = iconComponentCache.get(loaderKey)
    if (cachedIcon) {
      setIcon(() => cachedIcon)
      return () => {
        cancelled = true
      }
    }

    setIcon(() => Box)

    void loadIconComponent(loaderKey).then((nextIcon) => {
      if (!cancelled) {
        setIcon(() => nextIcon)
      }
    })

    return () => {
      cancelled = true
    }
  }, [loaderKey])

  return <Icon className={className} />
}
