import { FormEvent, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { getMessages } from '@extension/i18n'
import { requestOriginPermissions } from '@extension/network'
import {
  DEFAULT_PROBE_TIMEOUT_MS,
  defaultLanguage,
  defaultSettings,
  normalizeProbeTimeoutMs,
  normalizeUrl,
  readLanguage,
  readSettings,
  RESOLUTION_CACHE_TTL_MS,
  writeLanguage,
  writeSettings,
} from '@extension/storage'
import type { ExtensionLanguage, ExtensionSettings, OpenMode } from '@extension/types'
import './styles.css'

type SaveStatus =
  | { tone: 'idle'; kind: 'idle' }
  | { tone: 'success'; kind: 'saved' }
  | { tone: 'warn'; kind: 'saved-no-permission' }
  | { tone: 'error'; kind: 'invalid-url' | 'save-failed' }

function getStatusText(language: ExtensionLanguage, status: SaveStatus) {
  const messages = getMessages(language)

  switch (status.kind) {
    case 'idle':
      return messages.options.statusIdle
    case 'saved':
      return messages.options.statusSaved
    case 'saved-no-permission':
      return messages.options.statusSavedNoPermission
    case 'invalid-url':
      return messages.options.statusInvalidUrl
    case 'save-failed':
      return messages.options.statusSaveFailed
  }
}

export function OptionsApp() {
  const [form, setForm] = useState<ExtensionSettings>(defaultSettings)
  const [language, setLanguage] = useState<ExtensionLanguage>(defaultLanguage)
  const [status, setStatus] = useState<SaveStatus>({ tone: 'idle', kind: 'idle' })
  const [saving, setSaving] = useState(false)

  const messages = getMessages(language)
  const cacheSeconds = Math.round(RESOLUTION_CACHE_TTL_MS / 1000)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const [settings, nextLanguage] = await Promise.all([readSettings(), readLanguage()])
      if (!cancelled) {
        setForm(settings)
        setLanguage(nextLanguage)
      }
    }

    void load()

    return () => {
      cancelled = true
    }
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)

    try {
      const nextSettings: ExtensionSettings = {
        primaryUrl: normalizeUrl(form.primaryUrl),
        fallbackUrl: normalizeUrl(form.fallbackUrl),
        openMode: form.openMode,
        probeTimeoutMs: normalizeProbeTimeoutMs(form.probeTimeoutMs),
      }

      const permissionGranted = await requestOriginPermissions([
        nextSettings.primaryUrl,
        nextSettings.fallbackUrl,
      ])

      await writeSettings(nextSettings)
      setForm(nextSettings)
      setStatus(
        permissionGranted
          ? { tone: 'success', kind: 'saved' }
          : { tone: 'warn', kind: 'saved-no-permission' }
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : ''
      setStatus({
        tone: 'error',
        kind: message.includes('Invalid URL') ? 'invalid-url' : 'save-failed',
      })
    } finally {
      setSaving(false)
    }
  }

  function updateField<K extends keyof ExtensionSettings>(key: K, value: ExtensionSettings[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }))
  }

  function setOpenMode(mode: OpenMode) {
    updateField('openMode', mode)
  }

  async function handleLanguageChange(nextLanguage: ExtensionLanguage) {
    setLanguage(nextLanguage)
    await writeLanguage(nextLanguage)
  }

  return (
    <main className="page-shell settings-layout">
      <section className="settings-card panel">
        <div className="settings-head">
          <div className="settings-head-top">
            <div>
              <div className="eyebrow">Smart Harbor Extension</div>
              <h1>{messages.options.title}</h1>
            </div>
            <div
              className="language-toggle"
              role="group"
              aria-label={messages.options.languageToggleAriaLabel}
            >
              <button
                type="button"
                className={language === 'zh-CN' ? 'active' : ''}
                onClick={() => void handleLanguageChange('zh-CN')}
              >
                {messages.options.languageChinese}
              </button>
              <button
                type="button"
                className={language === 'en' ? 'active' : ''}
                onClick={() => void handleLanguageChange('en')}
              >
                {messages.options.languageEnglish}
              </button>
            </div>
          </div>
          <p className="hint">{messages.options.subtitle}</p>
        </div>

        <form className="settings-grid" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="primary-url">{messages.options.primaryUrlLabel}</label>
            <input
              id="primary-url"
              className="input"
              placeholder={messages.options.primaryUrlPlaceholder}
              value={form.primaryUrl}
              onChange={(event) => updateField('primaryUrl', event.target.value)}
            />
            <p className="field-help">{messages.options.primaryUrlHint}</p>
          </div>

          <div className="field">
            <label htmlFor="fallback-url">{messages.options.fallbackUrlLabel}</label>
            <input
              id="fallback-url"
              className="input"
              placeholder={messages.options.fallbackUrlPlaceholder}
              value={form.fallbackUrl}
              onChange={(event) => updateField('fallbackUrl', event.target.value)}
            />
            <p className="field-help">{messages.options.fallbackUrlHint}</p>
          </div>

          <div className="field">
            <label>{messages.options.openModeLabel}</label>
            <div
              className="toggle-group"
              role="tablist"
              aria-label={messages.options.openModeAriaLabel}
            >
              <button
                type="button"
                className={`toggle-option ${form.openMode === 'direct' ? 'active' : ''}`}
                onClick={() => setOpenMode('direct')}
              >
                {messages.options.openModeDirect}
              </button>
              <button
                type="button"
                className={`toggle-option ${form.openMode === 'embedded' ? 'active' : ''}`}
                onClick={() => setOpenMode('embedded')}
              >
                {messages.options.openModeEmbedded}
              </button>
            </div>
            <p className="field-help">{messages.options.openModeHint}</p>
          </div>

          <div className="field">
            <label htmlFor="probe-timeout-ms">{messages.options.probeTimeoutLabel}</label>
            <input
              id="probe-timeout-ms"
              type="number"
              min={50}
              max={5000}
              step={50}
              className="input"
              value={form.probeTimeoutMs}
              onChange={(event) => {
                const nextValue = Number(event.target.value)
                updateField(
                  'probeTimeoutMs',
                  Number.isFinite(nextValue) ? nextValue : DEFAULT_PROBE_TIMEOUT_MS
                )
              }}
            />
            <p className="field-help">
              {messages.options.probeTimeoutHint(DEFAULT_PROBE_TIMEOUT_MS, cacheSeconds)}
            </p>
          </div>

          <div className="footer-row">
            <div
              className={`status-note ${status.tone === 'success' ? 'success' : ''} ${status.tone === 'error' ? 'error' : ''} ${status.tone === 'warn' ? 'warn' : ''}`}
            >
              {getStatusText(language, status)}
            </div>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? messages.options.savingButton : messages.options.saveButton}
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<OptionsApp />)
