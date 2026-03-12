import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AuthCard } from '@/features/auth/AuthCard'
import { useSetupAuth } from '@/features/auth/useAuth'
import { useI18n } from '@/i18n/runtime'

export function SetupPage() {
  const { messages } = useI18n()
  const setupMutation = useSetupAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (password !== confirmPassword) {
      setFeedback(messages.authPage.confirmPasswordMismatch)
      return
    }

    setFeedback(null)

    setupMutation.mutate(
      {
        username,
        password,
      },
      {
        onError: (error) => {
          setFeedback(error instanceof Error ? error.message : messages.authPage.unknownError)
        },
      }
    )
  }

  return (
    <AuthCard title={messages.authPage.setupTitle} description={messages.authPage.setupDescription}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground">
            {messages.authPage.usernameLabel}
          </span>
          <Input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder={messages.authPage.usernamePlaceholder}
            autoComplete="username"
            className="h-10"
          />
          <p className="text-xs leading-5 text-muted-foreground">
            {messages.authPage.usernameHint}
          </p>
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground">
            {messages.authPage.passwordLabel}
          </span>
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder={messages.authPage.passwordPlaceholder}
            autoComplete="new-password"
            className="h-10"
          />
          <p className="text-xs leading-5 text-muted-foreground">
            {messages.authPage.passwordHint}
          </p>
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-foreground">
            {messages.authPage.confirmPasswordLabel}
          </span>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder={messages.authPage.confirmPasswordPlaceholder}
            autoComplete="new-password"
            className="h-10"
          />
        </label>

        <div className="min-h-5 text-sm text-red-500">{feedback}</div>

        <Button type="submit" className="h-10 w-full" disabled={setupMutation.isPending}>
          {setupMutation.isPending
            ? messages.authPage.setupSubmitting
            : messages.authPage.setupButton}
        </Button>
      </form>
    </AuthCard>
  )
}
