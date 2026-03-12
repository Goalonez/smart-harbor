import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { FeedbackProvider } from '@/features/feedback/FeedbackProvider'
import { useAppStore } from '@/store/appStore'

const queryClient = new QueryClient()

export function Providers({ children }: { children: React.ReactNode }) {
  const theme = useAppStore((state) => state.theme)
  const language = useAppStore((state) => state.language)

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  return (
    <QueryClientProvider client={queryClient}>
      <FeedbackProvider>{children}</FeedbackProvider>
    </QueryClientProvider>
  )
}
