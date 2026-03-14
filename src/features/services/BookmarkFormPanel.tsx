import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { IconPicker } from '@/components/IconPicker'
import { useI18n } from '@/i18n/runtime'
import type { ServicesConfig } from '@/config/schema'
import { getFeedbackNoticeClass } from '@/features/feedback/feedbackStyles'
import type { BookmarkFormValues } from '@/features/services/bookmarkForm'

interface FeedbackState {
  type: 'success' | 'error'
  message: string
}

interface BookmarkFormProps {
  config: ServicesConfig
  values: BookmarkFormValues
  feedback: FeedbackState | null
  submitLabel: string
  submitDisabled?: boolean
  onSubmit: () => void
  onCancel?: () => void
  onFieldChange: <K extends keyof BookmarkFormValues>(
    field: K,
    value: BookmarkFormValues[K]
  ) => void
}

export function BookmarkForm({
  config,
  values,
  feedback,
  submitLabel,
  submitDisabled,
  onSubmit,
  onCancel,
  onFieldChange,
}: BookmarkFormProps) {
  const { messages } = useI18n()
  const fieldCardClass = 'config-panel-card-muted space-y-1.5 p-3'
  const compactFieldCardClass = 'config-panel-card-muted space-y-1 p-2.5'
  const fieldLabelClass =
    'text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/90'

  return (
    <form
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <div className="config-scroll min-h-0 flex-1 overflow-y-auto px-3.5 py-3 pb-5 sm:px-5 sm:py-4 sm:pb-6">
        <div className="grid gap-3 md:grid-cols-2">
          {config.length === 0 ? (
            <label className={`${fieldCardClass} md:col-span-2`}>
              <span className={`block ${fieldLabelClass}`}>{messages.bookmarkForm.firstGroup}</span>
              <Input
                value={values.newGroupName}
                onChange={(event) => onFieldChange('newGroupName', event.target.value)}
                placeholder={messages.common.firstGroupExample}
                className="h-10"
              />
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {messages.bookmarkForm.firstGroupHint}
              </p>
            </label>
          ) : (
            <label className={fieldCardClass}>
              <span className={`block ${fieldLabelClass}`}>{messages.bookmarkForm.group}</span>
              <select
                value={values.groupIndex}
                onChange={(event) => onFieldChange('groupIndex', event.target.value)}
                className="config-panel-select"
              >
                {config.map((group, index) => (
                  <option key={group.category} value={index}>
                    {group.category}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {messages.bookmarkForm.groupHint}
              </p>
            </label>
          )}

          <label className={fieldCardClass}>
            <span className={`block ${fieldLabelClass}`}>{messages.bookmarkForm.name}</span>
            <Input
              value={values.name}
              onChange={(event) => onFieldChange('name', event.target.value)}
              placeholder={messages.common.bookmarkNameExample}
              className="h-10"
            />
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {messages.bookmarkForm.nameHint}
            </p>
          </label>

          <label className={fieldCardClass}>
            <span className={`block ${fieldLabelClass}`}>{messages.bookmarkForm.slug}</span>
            <Input
              value={values.slug}
              onChange={(event) => onFieldChange('slug', event.target.value)}
              placeholder={messages.common.bookmarkSlugExample}
              className="h-10"
            />
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {messages.bookmarkForm.slugHint}
            </p>
          </label>

          <label className={fieldCardClass}>
            <span className={`block ${fieldLabelClass}`}>{messages.bookmarkForm.icon}</span>
            <IconPicker
              size="sm"
              value={values.icon || undefined}
              onChange={(value) => onFieldChange('icon', value ?? '')}
            />
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {messages.bookmarkForm.iconHint}
            </p>
          </label>

          <label className={fieldCardClass}>
            <span className={`block ${fieldLabelClass}`}>{messages.bookmarkForm.primaryUrl}</span>
            <Input
              value={values.primaryUrl}
              onChange={(event) => onFieldChange('primaryUrl', event.target.value)}
              placeholder="http://192.168.1.100:8080"
              className="h-10"
            />
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {messages.bookmarkForm.primaryUrlHint}
            </p>
          </label>

          <label className={fieldCardClass}>
            <span className={`block ${fieldLabelClass}`}>{messages.bookmarkForm.secondaryUrl}</span>
            <Input
              value={values.secondaryUrl}
              onChange={(event) => onFieldChange('secondaryUrl', event.target.value)}
              placeholder="https://example.com"
              className="h-10"
            />
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {messages.bookmarkForm.secondaryUrlHint}
            </p>
          </label>

          <div className="grid gap-3 md:col-span-2 md:grid-cols-[minmax(0,1.45fr)_minmax(15rem,1fr)]">
            <label className={compactFieldCardClass}>
              <span className={`block ${fieldLabelClass}`}>{messages.bookmarkForm.probes}</span>
              <textarea
                value={values.probesText}
                onChange={(event) => onFieldChange('probesText', event.target.value)}
                spellCheck={false}
                rows={2}
                className="bookmark-form-probes config-panel-textarea min-h-[5.25rem] resize-y"
                placeholder={messages.common.probePlaceholder}
              />
              <p className="mt-0.5 text-[11px] leading-[1.2rem] text-muted-foreground sm:text-xs sm:leading-5">
                {messages.bookmarkForm.probesHint}
              </p>
            </label>

            <div className="min-w-0">
              <div className="config-panel-card flex h-full flex-col justify-between gap-2.5 p-2.5">
                <div>
                  <div className="text-[12px] font-medium text-foreground sm:text-[13px]">
                    {messages.bookmarkForm.forceNewTab}
                  </div>
                  <p className="mt-0.5 text-[11px] leading-[1.2rem] text-muted-foreground sm:text-xs sm:leading-5">
                    {messages.bookmarkForm.forceNewTabHint}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={values.forceNewTab}
                  onClick={() => onFieldChange('forceNewTab', !values.forceNewTab)}
                  data-checked={values.forceNewTab}
                  className="config-switch self-start"
                >
                  <span className="config-switch-thumb" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="z-10 flex flex-col gap-2 border-t border-border/65 bg-[linear-gradient(180deg,hsl(var(--background)/0.9),hsl(var(--background)/0.76))] px-3.5 py-2.5 pb-[calc(env(safe-area-inset-bottom)+0.625rem)] backdrop-blur-xl sm:px-5 sm:py-3 sm:pb-[calc(env(safe-area-inset-bottom)+0.75rem)] md:flex-row md:items-center md:justify-between md:pb-3">
        <div className={getFeedbackNoticeClass(feedback?.type)}>
          {feedback?.message ?? messages.bookmarkForm.footerHint}
        </div>
        <div className="flex flex-col justify-end gap-2 sm:flex-row sm:flex-wrap">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="w-full sm:w-auto"
            >
              {messages.common.close}
            </Button>
          )}
          <Button type="submit" size="sm" disabled={submitDisabled} className="w-full sm:w-auto">
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  )
}
