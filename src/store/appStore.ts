import { create } from 'zustand'
import type { NetworkMode } from '@/core/network/detectNetworkMode'
import { persistLanguage, resolveInitialLanguage, type Language } from '@/i18n/messages'

interface AppState {
  networkMode: NetworkMode
  searchKeyword: string
  theme: 'light' | 'dark'
  language: Language
  error: string | null
  setNetworkMode: (mode: NetworkMode) => void
  setSearchKeyword: (keyword: string) => void
  setTheme: (theme: 'light' | 'dark') => void
  setLanguage: (language: Language) => void
  setError: (error: string | null) => void
}

export const useAppStore = create<AppState>()((set) => ({
  networkMode: 'unknown',
  searchKeyword: '',
  theme: 'light',
  language: resolveInitialLanguage(),
  error: null,
  setNetworkMode: (mode) => set({ networkMode: mode }),
  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),
  setTheme: (theme) => {
    set({ theme })
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  },
  setLanguage: (language) => {
    persistLanguage(language)
    set({ language })
  },
  setError: (error) => set({ error }),
}))
