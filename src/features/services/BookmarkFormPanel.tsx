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
  onFieldChange: (field: keyof BookmarkFormValues, value: string) => void
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

  return (
    <form
      className="flex h-full flex-col"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <div className="grid gap-3 md:grid-cols-2">
          {config.length === 0 ? (
            <label className="md:col-span-2">
              <span className="mb-1 block text-[13px] font-medium text-foreground">
                {messages.bookmarkForm.firstGroup}
              </span>
              <Input
                value={values.newGroupName}
                onChange={(event) => onFieldChange('newGroupName', event.target.value)}
                placeholder={messages.common.firstGroupExample}
                className="h-9"
              />
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {messages.bookmarkForm.firstGroupHint}
              </p>
            </label>
          ) : (
            <label>
              <span className="mb-1 block text-[13px] font-medium text-foreground">
                {messages.bookmarkForm.group}
              </span>
              <select
                value={values.groupIndex}
                onChange={(event) => onFieldChange('groupIndex', event.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-ring/20"
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

          <label>
            <span className="mb-1 block text-[13px] font-medium text-foreground">
              {messages.bookmarkForm.name}
            </span>
            <Input
              value={values.name}
              onChange={(event) => onFieldChange('name', event.target.value)}
              placeholder={messages.common.bookmarkNameExample}
              className="h-9"
            />
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {messages.bookmarkForm.nameHint}
            </p>
          </label>

          <label>
            <span className="mb-1 block text-[13px] font-medium text-foreground">
              {messages.bookmarkForm.slug}
            </span>
            <Input
              value={values.slug}
              onChange={(event) => onFieldChange('slug', event.target.value)}
              placeholder={messages.common.bookmarkSlugExample}
              className="h-9"
            />
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {messages.bookmarkForm.slugHint}
            </p>
          </label>

          <label>
            <span className="mb-1 block text-[13px] font-medium text-foreground">
              {messages.bookmarkForm.icon}
            </span>
            <IconPicker
              size="sm"
              value={values.icon || undefined}
              onChange={(value) => onFieldChange('icon', value ?? '')}
            />
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {messages.bookmarkForm.iconHint}
            </p>
          </label>

          <label>
            <span className="mb-1 block text-[13px] font-medium text-foreground">
              {messages.bookmarkForm.primaryUrl}
            </span>
            <Input
              value={values.primaryUrl}
              onChange={(event) => onFieldChange('primaryUrl', event.target.value)}
              placeholder="http://192.168.1.100:8080"
              className="h-9"
            />
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {messages.bookmarkForm.primaryUrlHint}
            </p>
          </label>

          <label>
            <span className="mb-1 block text-[13px] font-medium text-foreground">
              {messages.bookmarkForm.secondaryUrl}
            </span>
            <Input
              value={values.secondaryUrl}
              onChange={(event) => onFieldChange('secondaryUrl', event.target.value)}
              placeholder="https://example.com"
              className="h-9"
            />
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {messages.bookmarkForm.secondaryUrlHint}
            </p>
          </label>

          <label className="md:col-span-2">
            <span className="mb-1 block text-[13px] font-medium text-foreground">
              {messages.bookmarkForm.probes}
            </span>
            <textarea
              value={values.probesText}
              onChange={(event) => onFieldChange('probesText', event.target.value)}
              spellCheck={false}
              rows={3}
              className="w-full resize-y rounded-md border border-border/80 bg-background px-3 py-2 text-sm outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-ring/20"
              placeholder={messages.common.probePlaceholder}
            />
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              {messages.bookmarkForm.probesHint}
            </p>
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-border/70 px-4 py-3 md:flex-row md:items-center md:justify-between">
        <div className={getFeedbackNoticeClass(feedback?.type)}>
          {feedback?.message ?? messages.bookmarkForm.footerHint}
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" size="sm" onClick={onCancel}>
              {messages.common.cancel}
            </Button>
          )}
          <Button type="submit" size="sm" disabled={submitDisabled}>
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  )
}
