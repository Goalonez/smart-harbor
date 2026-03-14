import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { FolderTree, GripVertical, Plus, SquarePen, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ConfigPanelLayout, ConfigPanelSection } from '@/components/ConfigPanelLayout'
import { ModalShell } from '@/components/ModalShell'
import { BookmarkForm } from '@/features/services/BookmarkFormPanel'
import {
  IMPORTED_BOOKMARK_GROUP_NAME,
  importBrowserBookmarks,
  parseBrowserBookmarksHtml,
} from '@/features/services/browserBookmarkImport'
import {
  buildSuggestedSlug,
  createEmptyBookmarkForm,
  formatBookmarkError,
  type BookmarkFormValues,
  validateBookmarkForm,
} from '@/features/services/bookmarkForm'
import {
  cloneServicesConfig,
  defaultServicesConfig,
  insertService,
  moveGroup,
  validateGroupName,
} from '@/features/services/servicesConfig'
import { useSaveServicesConfig } from '@/features/services/useSaveServicesConfig'
import { useServicesConfig } from '@/features/services/useServices'
import { getFeedbackNoticeClass } from '@/features/feedback/feedbackStyles'
import { useFeedback } from '@/features/feedback/useFeedback'
import { useI18n } from '@/i18n/runtime'
import { cn } from '@/lib/utils'

interface FeedbackState {
  type: 'success' | 'error'
  message: string
}

interface BookmarkManageButtonProps {
  initialOpen?: boolean
}

const sectionCardClass = 'config-panel-card p-4'
const compactSectionCardClass = 'config-panel-card p-3'

export function BookmarkManageButton({ initialOpen = false }: BookmarkManageButtonProps) {
  const { data: servicesConfig } = useServicesConfig()
  const saveMutation = useSaveServicesConfig()
  const { showToast, confirm } = useFeedback()
  const { messages } = useI18n()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [isOpen, setIsOpen] = useState(initialOpen)
  const [activeSection, setActiveSection] = useState<'groups' | 'bookmark' | 'import'>('groups')
  const [groupDrafts, setGroupDrafts] = useState<string[]>([])
  const [newGroupName, setNewGroupName] = useState('')
  const [bookmarkDraft, setBookmarkDraft] = useState<BookmarkFormValues>(
    createEmptyBookmarkForm(defaultServicesConfig)
  )
  const [bookmarkSlugTouched, setBookmarkSlugTouched] = useState(false)
  const [draggingGroupIndex, setDraggingGroupIndex] = useState<number | null>(null)
  const [dragOverGroupIndex, setDragOverGroupIndex] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<FeedbackState | null>(null)

  const activeConfig = useMemo(
    () => cloneServicesConfig(servicesConfig ?? defaultServicesConfig),
    [servicesConfig]
  )

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setGroupDrafts(activeConfig.map((group) => group.category))
    setNewGroupName('')
    setBookmarkDraft(createEmptyBookmarkForm(activeConfig))
    setBookmarkSlugTouched(false)
    setDraggingGroupIndex(null)
    setDragOverGroupIndex(null)
    setFeedback(null)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [activeConfig, isOpen])

  function openDialog() {
    setActiveSection('groups')
    setIsOpen(true)
  }

  function clearGroupDragState() {
    setDraggingGroupIndex(null)
    setDragOverGroupIndex(null)
  }

  function saveNextConfig(
    nextConfig: typeof activeConfig,
    successMessage: string,
    options?: {
      afterSave?: () => void
      closeOnSuccess?: boolean
    }
  ) {
    saveMutation.mutate(nextConfig, {
      onSuccess: () => {
        setFeedback({ type: 'success', message: successMessage })
        showToast({ type: 'success', message: successMessage })
        options?.afterSave?.()
        if (options?.closeOnSuccess) {
          setIsOpen(false)
        }
      },
      onError: (error) => {
        const message = error instanceof Error ? error.message : messages.common.saveFailedRetry
        setFeedback({
          type: 'error',
          message,
        })
        showToast({ type: 'error', message })
      },
    })
  }

  function handleAddGroup() {
    try {
      const category = validateGroupName(newGroupName, activeConfig)
      const nextConfig = [...activeConfig, { category, items: [] }]

      saveNextConfig(nextConfig, messages.bookmarkManage.groupSection.created(category), {
        afterSave: () => {
          setNewGroupName('')
        },
      })
    } catch (error) {
      const message = formatBookmarkError(error)
      setFeedback({ type: 'error', message })
      showToast({ type: 'error', message })
    }
  }

  function handleRenameGroup(groupIndex: number) {
    try {
      const category = validateGroupName(groupDrafts[groupIndex] ?? '', activeConfig, groupIndex)
      const nextConfig = cloneServicesConfig(activeConfig)
      nextConfig[groupIndex].category = category

      saveNextConfig(nextConfig, messages.bookmarkManage.groupSection.updated(category), {
        closeOnSuccess: true,
      })
    } catch (error) {
      const message = formatBookmarkError(error)
      setFeedback({ type: 'error', message })
      showToast({ type: 'error', message })
    }
  }

  async function handleDeleteGroup(groupIndex: number) {
    const targetGroup = activeConfig[groupIndex]
    if (!targetGroup) {
      return
    }

    const confirmMessage =
      targetGroup.items.length > 0
        ? messages.bookmarkManage.groupSection.confirmDeleteWithItems(
            targetGroup.category,
            targetGroup.items.length
          )
        : messages.bookmarkManage.groupSection.confirmDeleteEmpty(targetGroup.category)

    const confirmed = await confirm({
      title: messages.bookmarkManage.groupSection.confirmDeleteTitle,
      message: confirmMessage,
      confirmLabel: messages.bookmarkManage.groupSection.confirmDeleteAction,
      cancelLabel: messages.common.cancel,
      variant: 'destructive',
    })

    if (!confirmed) {
      return
    }

    const nextConfig = activeConfig.filter((_, index) => index !== groupIndex)
    saveNextConfig(nextConfig, messages.bookmarkManage.groupSection.deleted(targetGroup.category))
  }

  function handleMoveGroup(targetIndex: number) {
    if (draggingGroupIndex === null || draggingGroupIndex === targetIndex) {
      clearGroupDragState()
      return
    }

    try {
      const nextConfig = moveGroup(activeConfig, draggingGroupIndex, targetIndex)
      clearGroupDragState()
      saveNextConfig(nextConfig, messages.bookmarkManage.groupSection.orderUpdated)
    } catch (error) {
      clearGroupDragState()
      const message = formatBookmarkError(error)
      setFeedback({ type: 'error', message })
      showToast({ type: 'error', message })
    }
  }

  function handleBookmarkFieldChange<K extends keyof BookmarkFormValues>(
    field: K,
    value: BookmarkFormValues[K]
  ) {
    setBookmarkDraft((current) => {
      const nextDraft = { ...current, [field]: value } as BookmarkFormValues

      if (field === 'name' && !bookmarkSlugTouched) {
        nextDraft.slug = buildSuggestedSlug(String(value), activeConfig)
      }

      return nextDraft
    })

    if (field === 'slug') {
      setBookmarkSlugTouched(String(value).trim().length > 0)
    }

    setFeedback(null)
  }

  function handleAddBookmark() {
    try {
      const result = validateBookmarkForm(bookmarkDraft, activeConfig)
      const nextConfig =
        activeConfig.length === 0 && result.newGroupName
          ? [{ category: result.newGroupName, items: [result.service] }]
          : insertService(activeConfig, result.targetGroupIndex, result.service)

      saveNextConfig(
        nextConfig,
        messages.bookmarkManage.bookmarkSection.created(result.service.name),
        {
          afterSave: () => {
            setBookmarkDraft(createEmptyBookmarkForm(nextConfig))
            setBookmarkSlugTouched(false)
            setActiveSection('bookmark')
          },
          closeOnSuccess: true,
        }
      )
    } catch (error) {
      const message = formatBookmarkError(error)
      setFeedback({ type: 'error', message })
      showToast({ type: 'error', message })
    }
  }

  function openImportPicker() {
    fileInputRef.current?.click()
  }

  async function handleImportBookmarksFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) {
      return
    }

    try {
      const content = await file.text()
      const bookmarks = parseBrowserBookmarksHtml(content)
      const nextConfig = importBrowserBookmarks(activeConfig, bookmarks)

      saveNextConfig(
        nextConfig,
        messages.bookmarkManage.importSection.imported(
          bookmarks.length,
          IMPORTED_BOOKMARK_GROUP_NAME
        ),
        {
          afterSave: () => {
            setActiveSection('import')
          },
        }
      )
    } catch (error) {
      const fallbackMessage = messages.bookmarkManage.importSection.importFailed
      const message = error instanceof Error ? error.message : fallbackMessage
      setFeedback({ type: 'error', message })
      showToast({ type: 'error', message })
    }
  }

  const panelTabs = [
    {
      key: 'groups' as const,
      label: messages.bookmarkManage.groupSection.label,
      description: messages.bookmarkManage.groupSection.description,
      icon: FolderTree,
    },
    {
      key: 'bookmark' as const,
      label: messages.bookmarkManage.bookmarkSection.label,
      description: messages.bookmarkManage.bookmarkSection.description,
      icon: SquarePen,
    },
    {
      key: 'import' as const,
      label: messages.bookmarkManage.importSection.label,
      description: messages.bookmarkManage.importSection.description,
      icon: Upload,
    },
  ]

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label={messages.bookmarkManage.buttonAria}
        onClick={openDialog}
        className="h-10 w-10 rounded-full"
      >
        <Plus className="h-4.5 w-4.5" />
      </Button>

      <ModalShell
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title={messages.bookmarkManage.title}
        description={messages.bookmarkManage.description}
        icon={Plus}
      >
        <ConfigPanelLayout
          panelTitle={messages.bookmarkManage.panelTitle}
          tabs={panelTabs}
          activeTab={activeSection}
          onTabChange={setActiveSection}
        >
          {activeSection === 'groups' ? (
            <ConfigPanelSection
              title={messages.bookmarkManage.groupSection.title}
              summary={messages.bookmarkManage.groupSection.summary}
              footer={
                <>
                  <div className={getFeedbackNoticeClass(feedback?.type)}>
                    {feedback?.message ?? messages.bookmarkManage.groupSection.footerHint}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="w-full sm:w-auto"
                  >
                    {messages.common.close}
                  </Button>
                </>
              }
            >
              <div className="config-panel-card rounded-[1.2rem] border-dashed border-primary/20 bg-primary/[0.04] p-3">
                <div className="grid gap-2.5 md:grid-cols-[minmax(0,1fr)_auto]">
                  <Input
                    value={newGroupName}
                    onChange={(event) => {
                      setNewGroupName(event.target.value)
                      setFeedback(null)
                    }}
                    placeholder={messages.bookmarkManage.groupSection.createPlaceholder}
                    className="h-10"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddGroup}
                    disabled={saveMutation.isPending}
                  >
                    <Plus className="h-4 w-4" />
                    {messages.bookmarkManage.groupSection.createButton}
                  </Button>
                </div>
              </div>

              <div className="mt-3 grid gap-3">
                {activeConfig.length > 0 ? (
                  activeConfig.map((group, index) => {
                    const isDragging = draggingGroupIndex === index
                    const isDropTarget =
                      dragOverGroupIndex === index && draggingGroupIndex !== index

                    return (
                      <div
                        key={group.category}
                        draggable={!saveMutation.isPending}
                        onDragStart={(event) => {
                          event.dataTransfer.effectAllowed = 'move'
                          event.dataTransfer.setData('text/plain', String(index))
                          setDraggingGroupIndex(index)
                          setDragOverGroupIndex(index)
                          setFeedback(null)
                        }}
                        onDragOver={(event) => {
                          if (draggingGroupIndex === null || saveMutation.isPending) {
                            return
                          }

                          event.preventDefault()
                          event.dataTransfer.dropEffect = 'move'
                          setDragOverGroupIndex(index)
                        }}
                        onDrop={(event) => {
                          event.preventDefault()
                          handleMoveGroup(index)
                        }}
                        onDragEnd={clearGroupDragState}
                        className={cn(
                          `${compactSectionCardClass} transition`,
                          !saveMutation.isPending && 'cursor-grab',
                          isDragging && 'cursor-grabbing opacity-55',
                          isDropTarget && 'border-primary/40 ring-2 ring-primary/10'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1.5 rounded-lg border border-border/70 bg-muted/35 p-1.5 text-muted-foreground">
                            <GripVertical className="h-4 w-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col gap-2.5 md:flex-row md:items-center">
                              <Input
                                value={groupDrafts[index] ?? ''}
                                onChange={(event) => {
                                  const nextDrafts = [...groupDrafts]
                                  nextDrafts[index] = event.target.value
                                  setGroupDrafts(nextDrafts)
                                  setFeedback(null)
                                }}
                                placeholder={
                                  messages.bookmarkManage.groupSection.groupNamePlaceholder
                                }
                                className="h-10 md:flex-1"
                              />
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRenameGroup(index)}
                                  disabled={saveMutation.isPending}
                                >
                                  {messages.bookmarkManage.groupSection.saveButton}
                                </Button>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleDeleteGroup(index)}
                                  disabled={saveMutation.isPending}
                                >
                                  {messages.bookmarkManage.groupSection.deleteButton}
                                </Button>
                              </div>
                            </div>
                            <div className="mt-1.5 flex flex-wrap items-center gap-2.5 text-xs leading-5 text-muted-foreground">
                              <span>{messages.common.bookmarkCount(group.items.length)}</span>
                              <span>{messages.bookmarkManage.groupSection.dragHint}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="rounded-[1.2rem] border border-dashed border-border/80 bg-background/46 px-4 py-10 text-center text-sm text-muted-foreground">
                    {messages.bookmarkManage.groupSection.emptyState}
                  </div>
                )}
              </div>
            </ConfigPanelSection>
          ) : activeSection === 'bookmark' ? (
            <ConfigPanelSection
              title={messages.bookmarkManage.bookmarkSection.title}
              summary={messages.bookmarkManage.bookmarkSection.summary}
              bodyClassName="flex min-h-0 flex-1 flex-col overflow-hidden p-0"
            >
              <BookmarkForm
                config={activeConfig}
                values={bookmarkDraft}
                feedback={feedback}
                submitLabel={messages.bookmarkManage.bookmarkSection.submitButton}
                submitDisabled={saveMutation.isPending}
                onSubmit={handleAddBookmark}
                onCancel={() => setIsOpen(false)}
                onFieldChange={handleBookmarkFieldChange}
              />
            </ConfigPanelSection>
          ) : (
            <ConfigPanelSection
              title={messages.bookmarkManage.importSection.title}
              summary={messages.bookmarkManage.importSection.summary}
              footer={
                <>
                  <div className={getFeedbackNoticeClass(feedback?.type)}>
                    {feedback?.message ?? messages.bookmarkManage.importSection.footerHint}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="w-full sm:w-auto"
                  >
                    {messages.common.close}
                  </Button>
                </>
              }
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".html,.htm,text/html"
                className="hidden"
                onChange={handleImportBookmarksFile}
              />

              <div className="grid gap-3">
                <div className={sectionCardClass}>
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <Upload className="h-4.5 w-4.5 text-primary" />
                    {messages.bookmarkManage.importSection.fileTitle}
                  </div>
                  <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                    {messages.bookmarkManage.importSection.fileHint}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={openImportPicker}
                      disabled={saveMutation.isPending}
                    >
                      <Upload className="h-4 w-4" />
                      {messages.bookmarkManage.importSection.selectButton}
                    </Button>
                    <span className="text-xs leading-5 text-muted-foreground">
                      {messages.bookmarkManage.importSection.browserHint}
                    </span>
                  </div>
                </div>

                <div className={sectionCardClass}>
                  <div className="text-sm font-semibold text-foreground">
                    {messages.bookmarkManage.importSection.targetGroupTitle}
                  </div>
                  <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                    {messages.bookmarkManage.importSection.targetGroupHint(
                      IMPORTED_BOOKMARK_GROUP_NAME
                    )}
                  </p>
                </div>
              </div>
            </ConfigPanelSection>
          )}
        </ConfigPanelLayout>
      </ModalShell>
    </>
  )
}
