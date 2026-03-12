import { describe, expect, it } from 'vitest'
import {
  IMPORTED_BOOKMARK_GROUP_NAME,
  importBrowserBookmarks,
  parseBrowserBookmarksHtml,
} from '@/features/services/browserBookmarkImport'
import type { ServicesConfig } from '@/config/schema'

describe('browserBookmarkImport', () => {
  it('parses grouped browser bookmark html and preserves folder path', () => {
    const html = `
      <!DOCTYPE NETSCAPE-Bookmark-file-1>
      <DL><p>
        <DT><H3>Bookmarks Bar</H3>
        <DL><p>
          <DT><A HREF="https://www.google.com/">Google</A>
          <DT><H3>Dev</H3>
          <DL><p>
            <DT><A HREF="https://github.com/">GitHub</A>
          </DL><p>
        </DL><p>
        <DT><A HREF="https://example.com/root">Root Link</A>
      </DL><p>
    `

    expect(parseBrowserBookmarksHtml(html)).toEqual([
      { name: 'Google', url: 'https://www.google.com/', groupName: 'Bookmarks Bar' },
      { name: 'GitHub', url: 'https://github.com/', groupName: 'Bookmarks Bar / Dev' },
      { name: 'Root Link', url: 'https://example.com/root' },
    ])
  })

  it('imports ungrouped bookmarks into the default imported group', () => {
    const config: ServicesConfig = []

    const result = importBrowserBookmarks(config, [
      { name: 'OpenAI', url: 'https://openai.com/' },
      { name: 'GitHub', url: 'https://github.com/' },
    ])

    expect(result).toHaveLength(1)
    expect(result[0].category).toBe(IMPORTED_BOOKMARK_GROUP_NAME)
    expect(result[0].items.map((item) => item.slug)).toEqual(['openai', 'github'])
  })

  it('creates suffixed import groups for conflicting folder names and reuses default group for ungrouped bookmarks', () => {
    const config: ServicesConfig = [
      {
        category: 'Dev',
        items: [
          {
            slug: 'existing-dev',
            name: 'Existing Dev',
            primaryUrl: 'https://existing.example.com/',
          },
        ],
      },
      {
        category: IMPORTED_BOOKMARK_GROUP_NAME,
        items: [
          {
            slug: 'existing-imported',
            name: 'Existing Imported',
            primaryUrl: 'https://imported.example.com/',
          },
        ],
      },
    ]

    const result = importBrowserBookmarks(config, [
      { name: 'MDN', url: 'https://developer.mozilla.org/', groupName: 'Dev' },
      { name: 'Node.js', url: 'https://nodejs.org/', groupName: 'Dev' },
      { name: 'OpenAI', url: 'https://openai.com/' },
    ])

    expect(result.map((group) => group.category)).toEqual(['Dev', '导入书签', 'Dev(导入)'])
    expect(result[1].items.map((item) => item.slug)).toEqual(['existing-imported', 'openai'])
    expect(result[2].items.map((item) => item.slug)).toEqual(['mdn', 'nodejs'])
  })
})
