import { useMemo } from 'react'
import { getMessages } from '@/i18n/messages'
import { useAppStore } from '@/store/appStore'

export function useI18n() {
  const language = useAppStore((state) => state.language)

  const messages = useMemo(() => getMessages(language), [language])

  return {
    language,
    messages,
  }
}

export function getCurrentMessages() {
  return getMessages(useAppStore.getState().language)
}
