import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { AuthCard } from '@/features/auth/AuthCard'
import { useLogin } from '@/features/auth/useAuth'
import { useI18n } from '@/i18n/runtime'

function mapAuthError(
  message: string,
  fallback: string,
  messages: ReturnType<typeof useI18n>['messages']
) {
  if (message.includes('账号或密码错误') || message.includes('Invalid username or password')) {
    return messages.authPage.invalidCredentials
  }

  if (message.includes('尝试过于频繁') || message.includes('Too many attempts')) {
    return messages.authPage.tooManyAttempts
  }

  if (message.includes('请先创建管理员账号')) {
    return messages.authPage.setupRequired
  }

  return fallback
}

export function LoginPage() {
  const { messages } = useI18n()
  const loginMutation = useLogin()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [feedback, setFeedback] = useState<string | null>(null)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFeedback(null)

    loginMutation.mutate(
      {
        username,
        password,
      },
      {
        onError: (error) => {
          const fallback = error instanceof Error ? error.message : messages.authPage.unknownError
          setFeedback(mapAuthError(fallback, fallback, messages))
        },
      }
    )
  }

  return (
    <AuthCard title={messages.authPage.loginTitle} description={messages.authPage.loginDescription}>
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
            autoComplete="current-password"
            className="h-10"
          />
          <p className="text-xs leading-5 text-muted-foreground">
            {messages.authPage.passwordHint}
          </p>
        </label>

        <div className="min-h-5 text-sm text-red-500">{feedback}</div>

        <Button type="submit" className="h-10 w-full" disabled={loginMutation.isPending}>
          {loginMutation.isPending
            ? messages.authPage.loginSubmitting
            : messages.authPage.loginButton}
        </Button>
      </form>
    </AuthCard>
  )
}
