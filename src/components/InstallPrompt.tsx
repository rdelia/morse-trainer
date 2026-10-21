import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useInstallState, useInstallStore } from '../installPrompt'
import './InstallPrompt.css'

const DISMISS_KEY = 'morse-install-dismissed'

function readDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1'
  } catch {
    return false
  }
}

function writeDismissed(): void {
  try {
    localStorage.setItem(DISMISS_KEY, '1')
  } catch {
    // Storage blocked (private mode): the banner just returns next visit.
  }
}

export function InstallPrompt() {
  const { t } = useTranslation('common')
  const { available, ios } = useInstallState()
  const install = useInstallStore((s) => s.install)
  const [dismissed, setDismissed] = useState(readDismissed)

  if (!available || dismissed) return null

  function dismiss() {
    setDismissed(true)
    writeDismissed()
  }

  async function onInstall() {
    await install()
    dismiss()
  }

  return (
    <div className="install-banner" role="status">
      <p>{ios ? t('installIOSHint') : t('installHint')}</p>
      <div className="install-banner__actions">
        {!ios ? (
          <button type="button" className="btn btn--primary" onClick={() => void onInstall()}>
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
