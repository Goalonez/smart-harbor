import { useEffect, useState, type ComponentType } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n/runtime'

interface BookmarkManageButtonProps {
  initialOpen?: boolean
}

let bookmarkManageModulePromise: Promise<ComponentType<BookmarkManageButtonProps>> | null = null

function loadBookmarkManageButton() {
  if (!bookmarkManageModulePromise) {
    bookmarkManageModulePromise = import('./BookmarkManageButton').then(
      (module) => module.BookmarkManageButton
    )
  }

  return bookmarkManageModulePromise
}

export function LazyBookmarkManageButton() {
  const { messages } = useI18n()
  const [LoadedComponent, setLoadedComponent] = useState<ComponentType<BookmarkManageButtonProps> | null>(
    null
  )
  const [openOnLoad, setOpenOnLoad] = useState(false)

  useEffect(() => {
    if (!openOnLoad || LoadedComponent) {
      return
    }

    let cancelled = false

    void loadBookmarkManageButton().then((component) => {
      if (!cancelled) {
        setLoadedComponent(() => component)
      }
    })

    return () => {
      cancelled = true
    }
  }, [LoadedComponent, openOnLoad])

  if (LoadedComponent) {
    return <LoadedComponent initialOpen={openOnLoad} />
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={messages.bookmarkManage.buttonAria}
      className="h-10 w-10 rounded-full"
      onClick={() => setOpenOnLoad(true)}
      onMouseEnter={() => {
        void loadBookmarkManageButton()
      }}
      onFocus={() => {
        void loadBookmarkManageButton()
      }}
    >
      <Plus className="h-4 w-4" />
    </Button>
  )
}
