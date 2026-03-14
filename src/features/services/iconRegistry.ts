import type { ComponentType } from 'react'
import { loadServiceIcon, resolveDynamicIconName } from '@/features/services/icons'

type IconComponent = ComponentType<{
  className?: string
}>

type DynamicIconName = NonNullable<ReturnType<typeof resolveDynamicIconName>> | 'box'

const iconComponentCache = new Map<string, IconComponent>()
const iconPromiseCache = new Map<string, Promise<IconComponent>>()
const iconCacheListeners = new Set<() => void>()
let iconCacheVersion = 0

export function subscribeIconCache(listener: () => void) {
  iconCacheListeners.add(listener)
  return () => {
    iconCacheListeners.delete(listener)
  }
}

export function getIconCacheSnapshot() {
  return iconCacheVersion
}

function notifyIconCacheChanged() {
  iconCacheVersion += 1
  iconCacheListeners.forEach((listener) => listener())
}

export function getCachedIconComponent(loaderKey: DynamicIconName) {
  return iconComponentCache.get(loaderKey)
}

export function resolveIconLoaderKey(name?: string): DynamicIconName {
  return resolveDynamicIconName(name) ?? 'box'
}

export function loadIconComponent(loaderKey: DynamicIconName) {
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

export function preloadServiceIcons(names: readonly (string | undefined)[]) {
  const loaderKeys = Array.from(new Set(names.map((name) => resolveIconLoaderKey(name)))).filter(
    (loaderKey): loaderKey is DynamicIconName => loaderKey !== 'box'
  )

  const pendingLoads = loaderKeys.filter((loaderKey) => !iconComponentCache.has(loaderKey))
  if (pendingLoads.length === 0) {
    return Promise.resolve(false)
  }

  return Promise.all(pendingLoads.map((loaderKey) => loadIconComponent(loaderKey))).then(() => {
    notifyIconCacheChanged()
    return true
  })
}

export function notifyIconLoaded() {
  notifyIconCacheChanged()
}
