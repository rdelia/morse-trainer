import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '../stores/settingsStore'
import './OnboardingTour.css'

const STEPS = ['learn', 'practice', 'send', 'progress', 'reference', 'wiki', 'settings'] as const

export function OnboardingTour() {
  const { t } = useTranslation('common')
  const setSettings = useSettingsStore((s) => s.setSettings)
  const [index, setIndex] = useState(0)

  function finish() {
    void setSettings({ tourSeen: true })
  }

  const key = STEPS[index]
  const last = index === STEPS.length - 1

  return (
    <div className="tour-backdrop" role="dialog" aria-modal="true" aria-label={t('tour.title')}>
      <div className="tour-card">
        <p className="tour-card__step">
          {index + 1} / {STEPS.length}
        </p>
        <h2>{t(`tour.${key}Title`)}</h2>
        <p className="muted">{t(`tour.${key}Body`)}</p>

        <div className="tour-card__dots">
          {STEPS.map((s, i) => (
            <span key={s} className={i === index ? 'is-active' : undefined} />
          ))}
        </div>

        <div className="tour-card__actions">
          <button type="button" className="btn" onClick={finish}>
            {t('tour.skip')}
          </button>
          <div className="tour-card__nav">
            {index > 0 ? (
              <button type="button" className="btn" onClick={() => setIndex((i) => i - 1)}>
                {t('tour.back')}
              </button>
            ) : null}
            <button
              type="button"
              className="btn btn--primary"
              onClick={last ? finish : () => setIndex((i) => i + 1)}
            >
              {last ? t('tour.done') : t('tour.next')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
