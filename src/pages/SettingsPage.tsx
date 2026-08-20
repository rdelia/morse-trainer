import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '../components/LanguageSwitcher'
import { useSettingsStore } from '../stores/settingsStore'
import { useProgressStore } from '../stores/progressStore'
import { progressRepo } from '../data/idbProgressRepository'
import { useMorsePlayer } from '../hooks/useMorsePlayer'
import type { ProgressSnapshot } from '../data/types'

const SPEED_PRESETS = {
  slow: { characterWpm: 18, effectiveWpm: 5 },
  medium: { characterWpm: 18, effectiveWpm: 10 },
  fast: { characterWpm: 20, effectiveWpm: 18 },
} as const

type SpeedPreset = keyof typeof SPEED_PRESETS

export function SettingsPage() {
  const { t } = useTranslation('settings')
  const settings = useSettingsStore((s) => s.settings)
  const setSettings = useSettingsStore((s) => s.setSettings)
  const refresh = useProgressStore((s) => s.refresh)
  const { playText } = useMorsePlayer()
  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<string | null>(null)
  const advanced = settings.advancedSettings

  const activePreset = (Object.keys(SPEED_PRESETS) as SpeedPreset[]).find(
    (key) =>
      SPEED_PRESETS[key].characterWpm === settings.characterWpm &&
      SPEED_PRESETS[key].effectiveWpm === settings.effectiveWpm,
  )

  return (
    <div>
      <header className="page-hero">
        <h1>{t('title')}</h1>
        <p className="lede muted">{t('subtitle')}</p>
      </header>

      <div className="field">
        <label>{t('locale')}</label>
        <LanguageSwitcher />
      </div>

      <div className="field">
        <label>
          <input
            type="checkbox"
            checked={advanced}
            onChange={(e) =>
              void setSettings({ advancedSettings: e.target.checked })
            }
          />{' '}
          {t('advancedSettings')}
        </label>
        <p className="muted">{t('advancedSettingsHint')}</p>
      </div>

      {advanced ? (
        <>
          <div className="field">
            <label>
              {t('characterWpm')}: {settings.characterWpm}
            </label>
            <input
              type="range"
              min={12}
              max={40}
              value={settings.characterWpm}
              onChange={(e) =>
                void setSettings({ characterWpm: Number(e.target.value) })
              }
            />
          </div>

          <div className="field">
            <label>
              {t('effectiveWpm')}: {settings.effectiveWpm}
            </label>
            <input
              type="range"
              min={5}
              max={settings.characterWpm}
              value={Math.min(settings.effectiveWpm, settings.characterWpm)}
              onChange={(e) =>
                void setSettings({ effectiveWpm: Number(e.target.value) })
              }
            />
            <p className="muted">{t('farnsworthHint')}</p>
          </div>

          <div className="field">
            <label>
              {t('frequency')}: {settings.frequencyHz} Hz
            </label>
            <input
              type="range"
              min={400}
              max={900}
              step={10}
              value={settings.frequencyHz}
              onChange={(e) =>
                void setSettings({ frequencyHz: Number(e.target.value) })
              }
            />
          </div>
        </>
      ) : (
        <div className="field">
          <label>{t('speed')}</label>
          <div className="cta-row">
            {(Object.keys(SPEED_PRESETS) as SpeedPreset[]).map((key) => (
              <button
                key={key}
                type="button"
                className={activePreset === key ? 'btn btn--primary' : 'btn'}
                onClick={() => void setSettings(SPEED_PRESETS[key])}
              >
                {t(`speed_${key}`)}
              </button>
            ))}
          </div>
          <p className="muted">{t('speedHint')}</p>
        </div>
      )}

      <div className="field">
        <label>
          {t('volume')}: {Math.round(settings.volume * 100)}%
        </label>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={settings.volume}
          onChange={(e) => void setSettings({ volume: Number(e.target.value) })}
        />
      </div>

      <div className="field">
        <label>
          <input
            type="checkbox"
            checked={settings.showMorseAfterAnswer}
            onChange={(e) =>
              void setSettings({ showMorseAfterAnswer: e.target.checked })
            }
          />{' '}
          {t('showMorse')}
        </label>
      </div>

      {advanced ? (
        <div className="field">
          <label>
            <input
              type="checkbox"
              checked={settings.devMode}
              onChange={(e) => void setSettings({ devMode: e.target.checked })}
            />{' '}
            {t('devMode')}
          </label>
          <p className="muted">{t('devModeHint')}</p>
        </div>
      ) : null}

      <div className="cta-row">
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => void playText('PARIS')}
        >
          {t('testTone')}
        </button>
      </div>

      <h2 style={{ marginTop: '2rem' }}>Backup</h2>
      <div className="cta-row">
        <button
          type="button"
          className="btn"
          onClick={() => {
            void (async () => {
              const snap = await progressRepo.exportSnapshot()
              const blob = new Blob([JSON.stringify(snap, null, 2)], {
                type: 'application/json',
              })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = `morse-trainer-backup-${Date.now()}.json`
              a.click()
              URL.revokeObjectURL(url)
            })()
          }}
        >
          {t('export')}
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => fileRef.current?.click()}
        >
          {t('import')}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (!file) return
            void (async () => {
              try {
                const text = await file.text()
                const snap = JSON.parse(text) as ProgressSnapshot
                if (snap.version !== 1) throw new Error('bad version')
                await progressRepo.importSnapshot(snap)
                await useSettingsStore.getState().hydrate()
                await refresh()
                setMessage(t('importOk'))
              } catch {
                setMessage(t('importFail'))
              }
            })()
          }}
        />
        <button
          type="button"
          className="btn"
          onClick={() => {
            if (!confirm(t('resetConfirm'))) return
            void (async () => {
              await useProgressStore.getState().resetLearning()
              setMessage(t('resetOk'))
            })()
          }}
        >
          {t('reset')}
        </button>
      </div>
      {message ? <p className="muted">{message}</p> : null}

      <h2 style={{ marginTop: '2rem' }}>{t('aboutTitle')}</h2>
      <p className="muted">{t('aboutNote')}</p>
      <p>
        <a
          href="https://github.com/rdelia/morse-trainer"
          target="_blank"
          rel="noreferrer"
          style={{ color: '#fff' }}
        >
          github.com/rdelia/morse-trainer
        </a>
      </p>
      <p className="muted">{t('aboutLicense')}</p>
    </div>
  )
}
