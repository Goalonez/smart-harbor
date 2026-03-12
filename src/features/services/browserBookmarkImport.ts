import type { ServicesConfig } from '@/config/schema'
import { getCurrentMessages } from '@/i18n/runtime'
import {
  buildUniqueSlug,
  cleanServiceConfig,
  cloneServicesConfig,
} from '@/features/services/servicesConfig'

export interface ImportedBrowserBookmark {
  name: string
  url: string
  groupName?: string
}

export const IMPORTED_BOOKMARK_GROUP_NAME = '导入书签'

function isImportableBookmarkUrl(value: string) {
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

function deriveBookmarkName(name: string, url: string) {
  const trimmedName = name.trim()
  if (trimmedName) {
    return trimmedName
  }

  try {
    const parsed = new URL(url)
    return parsed.hostname.replace(/^www\./, '') || url
  } catch {
    return url
  }
}

function normalizeGroupPath(path: string[]) {
  const normalized = path.map((segment) => segment.trim()).filter(Boolean)
  return normalized.length > 0 ? normalized.join(' / ') : undefined
}

function collectBookmarksFromList(
  list: Element,
  currentPath: string[],
  bookmarks: ImportedBrowserBookmark[]
) {
  let pendingFolderPath: string[] | null = null

  Array.from(list.children).forEach((child) => {
    const tagName = child.tagName.toUpperCase()

    if (tagName === 'DT') {
      const directChildren = Array.from(child.children)
      const heading = directChildren.find((element) => element.tagName.toUpperCase() === 'H3')
      const anchor = directChildren.find(
        (element) => element.tagName.toUpperCase() === 'A' && element.getAttribute('href')
      )
      const nestedList = directChildren.find((element) => element.tagName.toUpperCase() === 'DL')

      if (anchor) {
        const url = anchor.getAttribute('href')?.trim() ?? ''

        if (isImportableBookmarkUrl(url)) {
          bookmarks.push({
            name: deriveBookmarkName(anchor.textContent ?? '', url),
            url,
            groupName: normalizeGroupPath(currentPath),
          })
        }
      }

      if (heading) {
        const folderName = heading.textContent?.trim() ?? ''
        const nextPath = folderName ? [...currentPath, folderName] : currentPath

        if (nestedList) {
          collectBookmarksFromList(nestedList, nextPath, bookmarks)
          pendingFolderPath = null
        } else {
          pendingFolderPath = nextPath
        }
      } else {
        pendingFolderPath = null
      }

      return
    }

    if (tagName === 'DL') {
      collectBookmarksFromList(child, pendingFolderPath ?? currentPath, bookmarks)
      pendingFolderPath = null
    }
  })
}

function buildImportedGroupName(baseName: string, occupiedNames: Set<string>) {
  const preferredName = `${baseName}(导入)`

  if (!occupiedNames.has(preferredName)) {
    return preferredName
  }

  let suffix = 2
  let candidateName = `${baseName}(导入${suffix})`

  while (occupiedNames.has(candidateName)) {
    suffix += 1
    candidateName = `${baseName}(导入${suffix})`
  }

  return candidateName
}

export function parseBrowserBookmarksHtml(input: string): ImportedBrowserBookmark[] {
  const messages = getCurrentMessages()
  const document = new DOMParser().parseFromString(input, 'text/html')
  const rootList = document.querySelector('dl')
  const bookmarks: ImportedBrowserBookmark[] = []

  if (rootList) {
    collectBookmarksFromList(rootList, [], bookmarks)
  } else {
    Array.from(document.querySelectorAll('a[href]')).forEach((anchor) => {
      const url = anchor.getAttribute('href')?.trim() ?? ''
      if (!isImportableBookmarkUrl(url)) {
        return
      }

      bookmarks.push({
        name: deriveBookmarkName(anchor.textContent ?? '', url),
        url,
      })
    })
  }

  if (bookmarks.length === 0) {
    throw new Error(messages.bookmarkManage.importSection.emptyState)
  }

  return bookmarks
}

export function importBrowserBookmarks(
  config: ServicesConfig,
  bookmarks: readonly ImportedBrowserBookmark[],
  defaultGroupName: string = IMPORTED_BOOKMARK_GROUP_NAME
) {
  const messages = getCurrentMessages()

  if (bookmarks.length === 0) {
    throw new Error(messages.bookmarkManage.importSection.emptyState)
  }

  const nextConfig = cloneServicesConfig(config)
  const groupsByName = new Map(nextConfig.map((group) => [group.category, group]))
  const occupiedGroupNames = new Set(groupsByName.keys())
  const resolvedImportGroups = new Map<string, string>()

  function ensureDefaultGroup() {
    const existing = groupsByName.get(defaultGroupName)
    if (existing) {
      return existing
    }

    const nextGroup = {
      category: defaultGroupName,
      items: [],
    }
    nextConfig.push(nextGroup)
    groupsByName.set(defaultGroupName, nextGroup)
    occupiedGroupNames.add(defaultGroupName)
    return nextGroup
  }

  function ensureImportGroup(importGroupName: string) {
    const resolvedGroupName = resolvedImportGroups.get(importGroupName)
    if (resolvedGroupName) {
      return groupsByName.get(resolvedGroupName)!
    }

    const targetGroupName = occupiedGroupNames.has(importGroupName)
      ? buildImportedGroupName(importGroupName, occupiedGroupNames)
      : importGroupName

    const nextGroup = {
      category: targetGroupName,
      items: [],
    }
    nextConfig.push(nextGroup)
    groupsByName.set(targetGroupName, nextGroup)
    occupiedGroupNames.add(targetGroupName)
    resolvedImportGroups.set(importGroupName, targetGroupName)
    return nextGroup
  }

  bookmarks.forEach((bookmark) => {
    const targetGroup = bookmark.groupName
      ? ensureImportGroup(bookmark.groupName)
      : ensureDefaultGroup()
    const name = deriveBookmarkName(bookmark.name, bookmark.url)
    const slug = buildUniqueSlug(name, nextConfig)

    targetGroup.items.push(
      cleanServiceConfig({
        slug,
        name,
        primaryUrl: bookmark.url,
      })
    )
  })

  return nextConfig
}
