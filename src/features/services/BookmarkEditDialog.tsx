import { useEffect, useMemo, useState } from 'react'
import { Pencil } from 'lucide-react'
import { ModalShell } from '@/components/ModalShell'
import type { ServicesConfig } from '@/config/schema'
import { useFeedback } from '@/features/feedback/useFeedback'
import { BookmarkForm } from '@/features/services/BookmarkFormPanel'
import { useI18n } from '@/i18n/runtime'
import {
  buildSuggestedSlug,
  createBookmarkFormFromService,
  createEmptyBookmarkForm,
  formatBookmarkError,
  type BookmarkFormValues,
  validateBookmarkForm,
} from '@/features/services/bookmarkForm'
import {
  cloneServicesConfig,
  findServiceLocation,
  insertService,
  removeService,
  replaceService,
} from '@/features/services/servicesConfig'
import { useSaveServicesConfig } from '@/features/services/useSaveServicesConfig'

interface FeedbackState {
  type: 'success' | 'error'
  message: string
}

interface BookmarkEditDialogProps {
  open: boolean
  config?: ServicesConfig
  serviceSlug: string | null
  onClose: () => void
}

export function BookmarkEditDialog({
  open,
  config,
  serviceSlug,
  onClose,
}: BookmarkEditDialogProps) {
  const saveMutation = useSaveServicesConfig()
  const { showToast } = useFeedback()
  const { messages } = useI18n()
  const [draft, setDraft] = useState<BookmarkFormValues>(createEmptyBookmarkForm([]))
  const [slugTouched, setSlugTouched] = useState(true)
  const [feedback, setFeedback] = useState<FeedbackState | null>(null)

  const activeConfig = useMemo(() => cloneServicesConfig(config ?? []), [config])
  const location = useMemo(
    () => (serviceSlug ? findServiceLocation(activeConfig, serviceSlug) : null),
    [activeConfig, serviceSlug]
  )
  const activeService = location
    ? activeConfig[location.groupIndex].items[location.serviceIndex]
    : null

  useEffect(() => {
    if (!open) {
      return
    }

    if (!location || !activeService) {
      onClose()
      return
    }

    setDraft(createBookmarkFormFromService(location.groupIndex, activeService))
    setSlugTouched(true)
    setFeedback(null)
  }, [activeService, location, onClose, open])

  function handleFieldChange(field: keyof BookmarkFormValues, value: string) {
    setDraft((current) => {
      const nextDraft = { ...current, [field]: value }

      if (field === 'name' && !slugTouched && activeService) {
        nextDraft.slug = buildSuggestedSlug(value, activeConfig, activeService.slug)
      }

      return nextDraft
    })

    if (field === 'slug') {
      setSlugTouched(value.trim().length > 0)
    }

    setFeedback(null)
  }

  function handleSubmit() {
    if (!location || !activeService) {
      return
    }

    try {
      const result = validateBookmarkForm(draft, activeConfig, { currentSlug: activeService.slug })

      const nextConfig =
        result.targetGroupIndex === location.groupIndex
          ? replaceService(activeConfig, location, result.service)
          : insertService(
              removeService(activeConfig, location),
              result.targetGroupIndex,
              result.service
            )

      saveMutation.mutate(nextConfig, {
        onSuccess: () => {
          showToast({ type: 'success', message: messages.bookmarkEdit.saved(result.service.name) })
          onClose()
        },
        onError: (error) => {
          const message = error instanceof Error ? error.message : messages.bookmarkEdit.saveFailed
          setFeedback({
            type: 'error',
            message,
          })
          showToast({ type: 'error', message })
        },
      })
    } catch (error) {
      const message = formatBookmarkError(error)
      setFeedback({ type: 'error', message })
      showToast({ type: 'error', message })
    }
  }

  if (!activeService) {
    return null
  }

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      title={messages.bookmarkEdit.title}
      description={messages.bookmarkEdit.description}
      icon={Pencil}
      widthClassName="max-w-3xl"
    >
      <div className="min-h-[520px] flex-1 overflow-hidden">
        <BookmarkForm
          config={activeConfig}
          values={draft}
          feedback={feedback}
          submitLabel={messages.bookmarkEdit.submitButton}
          submitDisabled={saveMutation.isPending}
          onSubmit={handleSubmit}
          onCancel={onClose}
          onFieldChange={handleFieldChange}
        />
      </div>
    </ModalShell>
  )
}
