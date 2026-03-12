import { FormEvent, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { requestOriginPermissions } from '@extension/network'
import {
  defaultSettings,
  normalizeUrl,
  readSettings,
  writeSettings,
} from '@extension/storage'
import type { ExtensionSettings, OpenMode } from '@extension/types'
import './styles.css'

type SaveStatus =
  | { tone: 'idle'; text: string }
  | { tone: 'success'; text: string }
  | { tone: 'warn'; text: string }
  | { tone: 'error'; text: string }

export function OptionsApp() {
  const [form, setForm] = useState<ExtensionSettings>(defaultSettings)
  const [status, setStatus] = useState<SaveStatus>({
    tone: 'idle',
    text: '填写主地址和切换地址后保存，新的标签页会按你的设置打开。',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const settings = await readSettings()
      if (!cancelled) {
        setForm(settings)
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
      }

      const permissionGranted = await requestOriginPermissions([
        nextSettings.primaryUrl,
        nextSettings.fallbackUrl,
      ])

      await writeSettings(nextSettings)
      setForm(nextSettings)

      setStatus(
        permissionGranted
          ? {
              tone: 'success',
              text: '保存成功。插件现在可以检测主地址连通性，并在需要时自动切换。',
            }
          : {
              tone: 'warn',
              text: '配置已保存，但你拒绝了地址访问权限。新标签页仍可打开地址，只是无法稳定检测主地址是否可达。',
            }
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : '保存失败'
      setStatus({
        tone: 'error',
        text: message.includes('Invalid URL') ? '地址格式无效，请输入完整地址或 IP:端口。' : message,
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

  return (
    <main className="page-shell settings-layout">
      <section className="settings-card panel">
        <div className="settings-head">
          <div className="eyebrow">Smart Harbor Extension</div>
          <h1>把导航页接到 Chrome 新标签页</h1>
          <p className="hint">
            插件只做地址接入与切换，不接管你的导航内容。主地址通常填写优先访问的地址，切换地址用于主地址不可用时自动兜底。
          </p>
        </div>

        <form className="settings-grid" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="primary-url">主地址</label>
            <input
              id="primary-url"
              className="input"
              placeholder="例如 http://localhost:3000 或 https://app.example.com"
              value={form.primaryUrl}
              onChange={(event) => updateField('primaryUrl', event.target.value)}
            />
            <p className="field-help">新标签页会优先探测这个地址，探测成功后优先打开它。</p>
          </div>

          <div className="field">
            <label htmlFor="fallback-url">切换地址</label>
            <input
              id="fallback-url"
              className="input"
              placeholder="例如 https://backup.example.com"
              value={form.fallbackUrl}
              onChange={(event) => updateField('fallbackUrl', event.target.value)}
            />
            <p className="field-help">当主地址不通时，插件会自动切换到这里。</p>
          </div>

          <div className="field">
            <label>打开方式</label>
            <div className="toggle-group" role="tablist" aria-label="打开方式">
              <button
                type="button"
                className={`toggle-option ${form.openMode === 'embedded' ? 'active' : ''}`}
                onClick={() => setOpenMode('embedded')}
              >
                内嵌框架
              </button>
              <button
                type="button"
                className={`toggle-option ${form.openMode === 'direct' ? 'active' : ''}`}
                onClick={() => setOpenMode('direct')}
              >
                直接跳转
              </button>
            </div>
            <p className="field-help">
              开启内嵌框架时，新标签页会直接整页显示目标地址。关闭后会直接跳到导航页地址。
            </p>
          </div>

          <div className="footer-row">
            <div
              className={`status-note ${status.tone === 'success' ? 'success' : ''} ${status.tone === 'error' ? 'error' : ''} ${status.tone === 'warn' ? 'warn' : ''}`}
            >
              {status.text}
            </div>
            <button className="btn btn-primary" type="submit" disabled={saving}>
              {saving ? '保存中...' : '保存配置'}
            </button>
          </div>
        </form>
      </section>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<OptionsApp />)
