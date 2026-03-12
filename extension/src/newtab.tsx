import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { resolveAvailableTarget } from '@extension/network'
import { readSettings } from '@extension/storage'
import type { ExtensionSettings, ResolvedTarget } from '@extension/types'
import './styles.css'

type NewTabState =
  | {
      phase: 'boot'
      settings: ExtensionSettings | null
      target: null
    }
  | {
      phase: 'ready'
      settings: ExtensionSettings
      target: ResolvedTarget
    }

function getStatusText(reason: ResolvedTarget['reason']): string {
  switch (reason) {
    case 'primary':
      return '主地址可用，正在打开导航页。'
    case 'fallback':
      return '主地址不可用，已自动切换到备用地址。'
    case 'primary-unverified':
      return '当前地址未做连通性验证，直接尝试打开。'
    case 'fallback-unverified':
      return '已切换到备用地址，但扩展没有权限验证连通性。'
    case 'unconfigured':
      return '尚未配置导航页地址。'
  }
}

export function App() {
  const [state, setState] = useState<NewTabState>({
    phase: 'boot',
    settings: null,
    target: null,
  })
  const [noticeVisible, setNoticeVisible] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      const settings = await readSettings()
      const target = await resolveAvailableTarget(settings.primaryUrl, settings.fallbackUrl)

      if (!cancelled) {
        setState({
          phase: 'ready',
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

    const timerId = window.setTimeout(() => {
      window.location.replace(state.target.activeUrl)
    }, 200)

    return () => window.clearTimeout(timerId)
  }, [state])

  if (state.phase === 'boot') {
    return (
      <main className="page-shell">
        <section className="loading-state panel">
          <div className="loading-card panel">
            <div className="eyebrow">Smart Harbor</div>
            <h2>正在检测可用地址</h2>
            <p className="pulse">优先检查主地址，不通时自动切换到备用地址。</p>
          </div>
        </section>
      </main>
    )
  }

  const { settings, target } = state

  if (!target.activeUrl) {
    return (
      <main className="page-shell">
        <section className="empty-state panel">
          <div className="empty-card panel">
            <div className="eyebrow">Smart Harbor</div>
            <h2>先配置导航页地址</h2>
            <p>
              这个新标签页插件只负责帮你打开导航页。先填写主地址和切换地址，再决定用内嵌框架还是直接跳转。
            </p>
            <div className="status-actions" style={{ marginTop: 24 }}>
              <button className="btn btn-primary" onClick={() => chrome.runtime.openOptionsPage()}>
                打开配置页
              </button>
            </div>
          </div>
        </section>
      </main>
    )
  }

  if (settings.openMode === 'direct') {
    return (
      <main className="page-shell">
        <section className="loading-state panel">
          <div className="loading-card panel">
            <div className="eyebrow">Redirecting</div>
            <h2>正在打开导航页</h2>
            <p>{getStatusText(target.reason)}</p>
            <p className="hint" style={{ marginTop: 10 }}>
              {target.activeUrl}
            </p>
            <div className="status-actions" style={{ marginTop: 24 }}>
              <button className="btn btn-primary" onClick={() => window.location.replace(target.activeUrl)}>
                立即打开
              </button>
              <button className="btn btn-secondary" onClick={() => chrome.runtime.openOptionsPage()}>
                配置插件
              </button>
            </div>
          </div>
        </section>
      </main>
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
          <div className="floating-notice-title">{target.reason === 'fallback' ? '已切换到备用地址' : '正在打开导航页'}</div>
          <div className="floating-notice-text">{getStatusText(target.reason)}</div>
        </div>
      ) : null}
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
