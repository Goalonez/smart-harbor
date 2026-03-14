import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { getMessages } from '@extension/i18n'
import { resolveAvailableTarget } from '@extension/network'
import { defaultLanguage, readLanguage, readSettings } from '@extension/storage'
import type { ExtensionLanguage, ExtensionSettings, ResolvedTarget } from '@extension/types'
import './styles.css'

const LOADING_UI_DELAY_MS = 240

type NewTabState =
  | {
      phase: 'boot'
      language: ExtensionLanguage
      settings: ExtensionSettings | null
      target: null
    }
  | {
      phase: 'ready'
      language: ExtensionLanguage
      settings: ExtensionSettings
      target: ResolvedTarget
    }

function getStatusText(language: ExtensionLanguage, reason: ResolvedTarget['reason']): string {
  return getMessages(language).newtab.statusByReason[reason]
}

export function App() {
  const [state, setState] = useState<NewTabState>({
    phase: 'boot',
    language: defaultLanguage,
    settings: null,
    target: null,
  })
  const [noticeVisible, setNoticeVisible] = useState(true)
  const [showLoadingUi, setShowLoadingUi] = useState(false)

  useEffect(() => {
    document.body.dataset.page = 'newtab'

    return () => {
      delete document.body.dataset.page
    }
  }, [])

  useEffect(() => {
    const timerId = window.setTimeout(() => setShowLoadingUi(true), LOADING_UI_DELAY_MS)
    return () => window.clearTimeout(timerId)
  }, [])

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      const [settings, language] = await Promise.all([readSettings(), readLanguage()])
      const target = await resolveAvailableTarget(
        settings.primaryUrl,
        settings.fallbackUrl,
        settings.probeTimeoutMs
      )

      if (!cancelled) {
        setState({
          phase: 'ready',
          language,
          settings,
          target,
        })
      }
    }

    void bootstrap()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (state.phase !== 'ready' || state.settings.openMode !== 'embedded') {
      return
    }

    if (state.target.reason === 'primary' || state.target.reason === 'unconfigured') {
      setNoticeVisible(false)
      return
    }

    setNoticeVisible(true)
    const timerId = window.setTimeout(() => setNoticeVisible(false), 3200)
    return () => window.clearTimeout(timerId)
  }, [state])

  useEffect(() => {
    if (state.phase !== 'ready') {
      return
    }

    if (state.settings.openMode !== 'direct' || !state.target.activeUrl) {
      return
    }

    window.location.replace(state.target.activeUrl)
  }, [state])

  if (state.phase === 'boot') {
    const messages = getMessages(state.language)

    if (!showLoadingUi) {
      return <main className="page-shell" />
    }

    return (
      <main className="page-shell">
        <section className="loading-state panel">
          <div className="loading-card panel">
            <div className="eyebrow">Smart Harbor</div>
            <h2>{messages.newtab.loadingTitle}</h2>
            <p className="pulse">{messages.newtab.loadingHint}</p>
          </div>
        </section>
      </main>
    )
  }

  const { language, settings, target } = state
  const messages = getMessages(language)

  if (!target.activeUrl) {
    return (
      <main className="page-shell">
        <section className="empty-state panel">
          <div className="empty-card panel">
            <div className="eyebrow">Smart Harbor</div>
            <h2>{messages.newtab.unconfiguredTitle}</h2>
            <p>{messages.newtab.unconfiguredDescription}</p>
            <div className="status-actions" style={{ marginTop: 24 }}>
              <button className="btn btn-primary" onClick={() => chrome.runtime.openOptionsPage()}>
                {messages.newtab.openSettingsButton}
              </button>
            </div>
          </div>
        </section>
      </main>
    )
  }

  if (settings.openMode === 'direct') {
    return showLoadingUi ? (
      <main className="page-shell">
        <section className="loading-state panel">
          <div className="loading-card panel">
            <div className="eyebrow">Smart Harbor</div>
            <h2>{messages.newtab.loadingTitle}</h2>
            <p className="pulse">{messages.newtab.loadingHint}</p>
          </div>
        </section>
      </main>
    ) : (
      <main className="page-shell" />
    )
  }

  return (
    <main className="embedded-shell">
      <iframe
        title="Smart Harbor"
        src={target.activeUrl}
        className="embedded-frame fullbleed"
        referrerPolicy="no-referrer"
      />
      {noticeVisible ? (
        <div className="floating-notice">
          <div className="floating-notice-title">
            {target.reason === 'fallback'
              ? messages.newtab.noticeFallbackTitle
              : messages.newtab.noticeOpeningTitle}
          </div>
          <div className="floating-notice-text">{getStatusText(language, target.reason)}</div>
        </div>
      ) : null}
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
