import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import './InstallPrompt.css'

const DISMISS_KEY = 'morse-install-dismissed'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function isIOSDevice(): boolean {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

export function InstallPrompt() {
  const { t } = useTranslation('common')
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)
  const [ios, setIos] = useState(false)

  useEffect(() => {
    if (isStandalone() || localStorage.getItem(DISMISS_KEY) === '1') return

    if (isIOSDevice()) {
      setIos(true)
      setVisible(true)
      return
    }

    function onBeforeInstall(e: Event) {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall)
  }, [])

  function dismiss() {
    setVisible(false)
    localStorage.setItem(DISMISS_KEY, '1')
  }

  async function install() {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
    setVisible(false)
    localStorage.setItem(DISMISS_KEY, '1')
  }

  if (!visible) return null

  return (
    <div className="install-banner" role="status">
      <p>{ios ? t('installIOSHint') : t('installHint')}</p>
      <div className="install-banner__actions">
        {!ios ? (
          <button type="button" className="btn btn--primary" onClick={() => void install()}>
            {t('installAction')}
          </button>
        ) : null}
        <button type="button" className="btn" onClick={dismiss}>
          {t('installDismiss')}
        </button>
      </div>
    </div>
  )
}
