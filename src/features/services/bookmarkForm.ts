import { ZodError } from 'zod'
import type { ServiceConfig, ServicesConfig } from '@/config/schema'
import { getCurrentMessages } from '@/i18n/runtime'
import {
  buildUniqueSlug,
  cleanServiceConfig,
  validateGroupName,
} from '@/features/services/servicesConfig'

export interface BookmarkFormValues {
  groupIndex: string
  newGroupName: string
  name: string
  slug: string
  icon: string
  primaryUrl: string
  secondaryUrl: string
  forceNewTab: boolean
}

interface ValidateBookmarkFormOptions {
  currentSlug?: string
}

function getNextBookmarkIndex(config: ServicesConfig) {
  return config.reduce((count, group) => count + group.items.length, 0) + 1
}

function buildDefaultBookmarkSlugFallback(config: ServicesConfig) {
  return `service-${getNextBookmarkIndex(config)}`
}

export function createEmptyBookmarkForm(config: ServicesConfig): BookmarkFormValues {
  const messages = getCurrentMessages()
  const nextIndex = getNextBookmarkIndex(config)
  const name = messages.common.newBookmarkName(nextIndex)

  return {
    groupIndex: config.length > 0 ? '0' : '',
    newGroupName: '',
    name,
    slug: buildUniqueSlug(`service-${nextIndex}`, config),
    icon: '',
    primaryUrl: 'http://127.0.0.1',
    secondaryUrl: '',
    forceNewTab: false,
  }
}

export function createBookmarkFormFromService(
  groupIndex: number,
  service: ServiceConfig
): BookmarkFormValues {
  return {
    groupIndex: String(groupIndex),
    newGroupName: '',
    name: service.name,
    slug: service.slug,
    icon: service.icon ?? '',
    primaryUrl: service.primaryUrl,
    secondaryUrl: service.secondaryUrl ?? '',
    forceNewTab: service.forceNewTab ?? false,
  }
}

export function buildSuggestedSlug(
  name: string,
  config: ServicesConfig,
  currentSlug?: string,
  fallback?: string
) {
  const nextFallback =
    fallback?.trim() || currentSlug || buildDefaultBookmarkSlugFallback(config)

  return buildUniqueSlug(name, config, currentSlug, nextFallback)
}

export function validateBookmarkForm(
  values: BookmarkFormValues,
  config: ServicesConfig,
  options?: ValidateBookmarkFormOptions
) {
  const messages = getCurrentMessages()
  const hasGroups = config.length > 0
  const nextSlug =
    values.slug.trim() || buildSuggestedSlug(values.name, config, options?.currentSlug)
  const nextService = cleanServiceConfig({
    slug: nextSlug,
    name: values.name.trim(),
    icon: values.icon.trim() || undefined,
    primaryUrl: values.primaryUrl.trim(),
    secondaryUrl: values.secondaryUrl.trim(),
    forceNewTab: values.forceNewTab,
  })

  const duplicatedSlug = config.some((group) =>
    group.items.some(
      (service) => service.slug === nextService.slug && service.slug !== options?.currentSlug
    )
  )

  if (duplicatedSlug) {
    throw new Error(messages.errors.bookmarkSlugExists(nextService.slug))
  }

  if (!hasGroups) {
    return {
      targetGroupIndex: 0,
      newGroupName: validateGroupName(values.newGroupName, config),
      service: nextService,
    }
  }

  const targetGroupIndex = Number(values.groupIndex)
  if (
    !Number.isInteger(targetGroupIndex) ||
    targetGroupIndex < 0 ||
    targetGroupIndex >= config.length
  ) {
    throw new Error(messages.errors.selectBookmarkGroup)
  }

  return {
    targetGroupIndex,
    newGroupName: undefined,
    service: nextService,
  }
}

export function formatBookmarkError(error: unknown) {
  const messages = getCurrentMessages()

  if (error instanceof ZodError) {
    const firstIssue = error.issues[0]
    const field = String(firstIssue?.path?.[0] ?? '')

    if (field === 'name') {
      return messages.errors.bookmarkNameRequired
    }

    if (field === 'slug') {
      return messages.errors.bookmarkSlugFormat
    }

    if (field === 'primaryUrl') {
      return messages.errors.primaryUrlInvalid
    }

    if (field === 'secondaryUrl') {
      return messages.errors.secondaryUrlInvalid
    }

    return firstIssue?.message ?? messages.errors.validationFailed
  }

  return error instanceof Error ? error.message : messages.common.genericActionFailed
}
