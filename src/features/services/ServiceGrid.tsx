import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Pencil, Trash2 } from 'lucide-react'
import { useI18n } from '@/i18n/runtime'
import { useAppStore } from '@/store/appStore'
import { useFeedback } from '@/features/feedback/useFeedback'
import { LazyBookmarkEditDialog } from '@/features/services/LazyBookmarkEditDialog'
import {
  cloneServicesConfig,
  defaultServicesConfig,
  findServiceLocation,
  moveService,
  removeService,
} from '@/features/services/servicesConfig'
import { useSaveServicesConfig } from '@/features/services/useSaveServicesConfig'
import { ServiceCard } from './ServiceCard'
import { useServices } from './useServices'

interface DragOverState {
  groupIndex: number
  serviceIndex?: number
}

interface ContextMenuState {
  slug: string
  x: number
  y: number
}

const DESKTOP_SECTION_PADDING_PX = 24
const DESKTOP_LABEL_WIDTH_PX = 80
const DESKTOP_CONTENT_GAP_PX = 16
const DESKTOP_CARD_WIDTH_PX = 152
const DESKTOP_CARD_GAP_PX = 10

function getCompactGroupWidth(cardCount: number) {
  const totalCardWidth = cardCount * DESKTOP_CARD_WIDTH_PX
  const totalCardGaps = Math.max(cardCount - 1, 0) * DESKTOP_CARD_GAP_PX

  return (
    DESKTOP_SECTION_PADDING_PX +
    DESKTOP_LABEL_WIDTH_PX +
    DESKTOP_CONTENT_GAP_PX +
    totalCardWidth +
    totalCardGaps
  )
}

export function ServiceGrid() {
  const { groupedServices, isLoading, config } = useServices()
  const searchKeyword = useAppStore((state) => state.searchKeyword)
  const saveMutation = useSaveServicesConfig()
  const { showToast, confirm } = useFeedback()
  const { messages } = useI18n()
  const [isVisible, setIsVisible] = useState(false)
  const [draggingSlug, setDraggingSlug] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<DragOverState | null>(null)
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)
  const [editingSlug, setEditingSlug] = useState<string | null>(null)
  const [gridWidth, setGridWidth] = useState(0)
  const gridRef = useRef<HTMLDivElement | null>(null)

  const activeConfig = useMemo(() => cloneServicesConfig(config ?? defaultServicesConfig), [config])
  const canDrag = searchKeyword.trim().length === 0 && !saveMutation.isPending

  const displayGroups = useMemo(
    () =>
      groupedServices
        .map((group) => ({
          ...group,
          actualGroupIndex: activeConfig.findIndex((item) => item.category === group.category),
        }))
        .filter((group) => group.actualGroupIndex >= 0),
    [activeConfig, groupedServices]
  )

  useEffect(() => {
    if (isLoading || groupedServices.length === 0) {
      setIsVisible(false)
      return
    }

    setIsVisible(false)
    const timeoutId = setTimeout(() => setIsVisible(true), 40)

    return () => clearTimeout(timeoutId)
  }, [groupedServices.length, isLoading])

  useEffect(() => {
    if (!contextMenu) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setContextMenu(null)
      }
    }

    const closeMenu = () => setContextMenu(null)

    document.addEventListener('scroll', closeMenu, true)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('scroll', closeMenu, true)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [contextMenu])

  useEffect(() => {
    const element = gridRef.current
    if (!element || typeof ResizeObserver === 'undefined') {
      return
    }

    const updateWidth = (width: number) => {
      setGridWidth((currentWidth) => (currentWidth === width ? currentWidth : width))
    }

    updateWidth(Math.round(element.getBoundingClientRect().width))

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (!entry) {
        return
      }

      updateWidth(Math.round(entry.contentRect.width))
    })

    observer.observe(element)

    return () => observer.disconnect()
  }, [displayGroups.length, isLoading])

  function clearDragState() {
    setDraggingSlug(null)
    setDragOver(null)
  }

  function commitDrop(targetGroupIndex: number, targetServiceIndex?: number) {
    if (!draggingSlug) {
      return
    }

    const source = findServiceLocation(activeConfig, draggingSlug)
    if (!source) {
      clearDragState()
      return
    }

    const sourceGroup = activeConfig[source.groupIndex]
    const isSameGroup = source.groupIndex === targetGroupIndex
    const isDropToSameSpot =
      isSameGroup &&
      ((typeof targetServiceIndex === 'number' &&
        (targetServiceIndex === source.serviceIndex ||
          targetServiceIndex === source.serviceIndex + 1)) ||
        (typeof targetServiceIndex === 'undefined' &&
          source.serviceIndex === sourceGroup.items.length - 1))

    if (isDropToSameSpot) {
      clearDragState()
      return
    }

    try {
      const nextConfig = moveService(activeConfig, source, targetGroupIndex, targetServiceIndex)
      clearDragState()
      saveMutation.mutate(nextConfig)
    } catch {
      clearDragState()
    }
  }

  async function handleDeleteBookmark(slug: string) {
    const location = findServiceLocation(activeConfig, slug)
    if (!location) {
      return
    }

    const service = activeConfig[location.groupIndex].items[location.serviceIndex]
    const serviceName = service.name
    setContextMenu(null)
    const confirmed = await confirm({
      title: messages.serviceGrid.confirmDeleteTitle,
      message: messages.serviceGrid.confirmDeleteMessage(serviceName),
      confirmLabel: messages.serviceGrid.confirmDeleteAction,
      cancelLabel: messages.common.cancel,
      variant: 'destructive',
    })

    if (!confirmed) {
      return
    }

    const nextConfig = removeService(activeConfig, location)
    saveMutation.mutate(nextConfig, {
      onSuccess: () => {
        showToast({ type: 'success', message: messages.serviceGrid.deleted(serviceName) })
      },
      onError: (error) => {
        const message = error instanceof Error ? error.message : messages.serviceGrid.deleteFailed
        showToast({ type: 'error', message })
      },
    })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <p className="text-muted-foreground">{messages.common.loading}</p>
      </div>
    )
  }

  if (groupedServices.length === 0) {
    const hasAnyBookmarks = activeConfig.some((group) => group.items.length > 0)

    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="max-w-lg rounded-2xl border border-dashed border-border/80 bg-muted/15 px-6 py-8 text-center">
          <p className="text-base font-semibold text-foreground">
            {hasAnyBookmarks ? messages.home.noSearchResults : messages.home.emptyTitle}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {hasAnyBookmarks ? messages.common.noServices : messages.home.emptyDescription}
          </p>
        </div>
      </div>
    )
  }

  const menuLeft = contextMenu ? Math.min(contextMenu.x, window.innerWidth - 180) : 0
  const menuTop = contextMenu ? Math.min(contextMenu.y, window.innerHeight - 120) : 0

  return (
    <>
      <div ref={gridRef} className="flex w-full flex-wrap items-start gap-3 md:gap-4">
        {displayGroups.map((group, groupIndex) => {
          const isGroupDropTarget =
            dragOver?.groupIndex === group.actualGroupIndex &&
            typeof dragOver.serviceIndex === 'undefined'
          const compactGroupWidth = getCompactGroupWidth(group.services.length)
          const canKeepSingleRow = group.services.length > 0 && compactGroupWidth <= gridWidth

          return (
            <section
              key={group.category}
              className={`w-full rounded-xl border border-border/80 bg-muted/18 p-2.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-sm transition md:p-3 dark:bg-muted/12 ${canKeepSingleRow ? 'lg:max-w-full lg:flex-none lg:w-fit' : 'lg:w-full'} ${isGroupDropTarget ? 'border-primary/40 ring-2 ring-primary/10' : ''}`}
            >
              <div className="flex flex-col gap-2.5 md:flex-row md:items-start md:gap-4">
                <div className="flex w-full shrink-0 items-center justify-between rounded-lg border border-border/70 bg-background/45 px-3 py-2 text-left shadow-sm md:w-20 md:flex-col md:items-start md:justify-start md:px-3">
                  <h3 className="text-[13px] font-semibold tracking-tight leading-5 text-foreground break-words">
                    {group.category}
                  </h3>
                  <span className="text-[11px] text-muted-foreground md:mt-1">
                    {messages.common.itemCount(group.services.length)}
                  </span>
                </div>

                <div
                  className={`grid min-h-[76px] w-full flex-1 grid-cols-[repeat(auto-fill,minmax(7.5rem,1fr))] gap-2 rounded-lg transition sm:grid-cols-[repeat(auto-fill,minmax(8.25rem,1fr))] md:gap-2.5 ${canKeepSingleRow ? 'lg:flex lg:w-fit lg:flex-none lg:flex-nowrap lg:justify-start' : 'lg:flex lg:flex-1 lg:flex-wrap lg:content-start lg:justify-start'} ${isGroupDropTarget ? 'bg-primary/5 p-1.5' : ''}`}
                  onDragOver={(event) => {
                    if (!canDrag || !draggingSlug) {
                      return
                    }
                    event.preventDefault()
                    event.dataTransfer.dropEffect = 'move'
                    setDragOver({ groupIndex: group.actualGroupIndex })
                  }}
                  onDrop={(event) => {
                    if (!canDrag) {
                      return
                    }
                    event.preventDefault()
                    commitDrop(group.actualGroupIndex)
                  }}
                >
                  {group.services.length > 0 ? (
                    group.services.map((service, index) => {
                      const isCardDropTarget =
                        dragOver?.groupIndex === group.actualGroupIndex &&
                        dragOver?.serviceIndex === index

                      return (
                        <div
                          key={service.slug}
                          className={`transform-gpu transition-all duration-500 ease-out lg:w-[9.5rem] ${
                            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
                          }`}
                          style={{ transitionDelay: `${(groupIndex * 3 + index) * 45}ms` }}
                        >
                          <ServiceCard
                            service={service}
                            draggable={canDrag}
                            isDragging={draggingSlug === service.slug}
                            isDropTarget={isCardDropTarget}
                            onDragStart={(event) => {
                              if (!canDrag) {
                                event.preventDefault()
                                return
                              }
                              event.dataTransfer.effectAllowed = 'move'
                              event.dataTransfer.setData('text/plain', service.slug)
                              setContextMenu(null)
                              setDraggingSlug(service.slug)
                            }}
                            onDragOver={(event) => {
                              if (!canDrag || !draggingSlug) {
                                return
                              }
                              event.preventDefault()
                              event.stopPropagation()
                              event.dataTransfer.dropEffect = 'move'
                              setDragOver({
                                groupIndex: group.actualGroupIndex,
                                serviceIndex: index,
                              })
                            }}
                            onDrop={(event) => {
                              if (!canDrag) {
                                return
                              }
                              event.preventDefault()
                              event.stopPropagation()
                              commitDrop(group.actualGroupIndex, index)
                            }}
                            onDragEnd={clearDragState}
                            onContextMenu={(event) => {
                              event.preventDefault()
                              setContextMenu({
                                slug: service.slug,
                                x: event.clientX,
                                y: event.clientY,
                              })
                            }}
                          />
                        </div>
                      )
                    })
                  ) : (
                    <div className="col-span-full flex min-h-[84px] min-w-[250px] items-center justify-center rounded-lg border border-dashed border-border/70 bg-background/40 px-4 text-sm text-muted-foreground">
                      {messages.serviceGrid.dropHint}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )
        })}
      </div>

      <LazyBookmarkEditDialog
        open={editingSlug !== null}
        config={activeConfig}
        serviceSlug={editingSlug}
        onClose={() => setEditingSlug(null)}
      />

      {contextMenu &&
        createPortal(
          <div className="fixed inset-0 z-[95]" onClick={() => setContextMenu(null)}>
            <div
              className="absolute w-44 overflow-hidden rounded-xl border border-border/80 bg-popover p-1 shadow-2xl"
              style={{ left: menuLeft, top: menuTop }}
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => {
                  setEditingSlug(contextMenu.slug)
                  setContextMenu(null)
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-accent"
              >
                <Pencil className="h-4 w-4" />
                {messages.serviceGrid.editAction}
              </button>
              <button
                type="button"
                onClick={() => handleDeleteBookmark(contextMenu.slug)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-500 transition hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" />
                {messages.serviceGrid.deleteAction}
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
