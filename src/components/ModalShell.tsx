import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X, type LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n/runtime'
import { cn } from '@/lib/utils'

interface ModalShellProps {
  open: boolean
  title: string
  description?: string
  icon: LucideIcon
  widthClassName?: string
  onClose: () => void
  children: ReactNode
}

export function ModalShell({
  open,
  title,
  description,
  icon: Icon,
  widthClassName,
  onClose,
  children,
}: ModalShellProps) {
  const { messages } = useI18n()

  useEffect(() => {
    if (!open) {
      return
    }

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose, open])

  if (!open) {
    return null
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[90] bg-black/60 p-3 backdrop-blur-sm sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div
        className={cn(
          'mx-auto mt-2 flex max-h-[calc(100vh-1.5rem)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-border/80 bg-background shadow-2xl sm:mt-4 sm:max-h-[calc(100vh-2rem)]',
          widthClassName
        )}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-border/70 px-4 py-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <div className="rounded-xl border border-border/80 bg-muted/35 p-1.5 text-primary">
                <Icon className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-base font-semibold tracking-tight text-foreground">
                  {title}
                </h2>
                {description && (
                  <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{description}</p>
                )}
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={messages.common.closeModal}
            onClick={onClose}
            className="h-8 w-8 shrink-0 rounded-lg"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {children}
      </div>
    </div>,
    document.body
  )
}
