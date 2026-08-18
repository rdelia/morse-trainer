import { useTranslation } from 'react-i18next'
import { useSettingsStore } from '../stores/settingsStore'
import type { Locale } from '../data/types'
import './LanguageSwitcher.css'

const LOCALES: { code: Locale; label: string }[] = [
  { code: 'en', label: 'ENG' },
  { code: 'it', label: 'ITA' },
  { code: 'es', label: 'ESP' },
  { code: 'fr', label: 'FRA' },
  { code: 'ro', label: 'ROU' },
  { code: 'ca-valencia', label: 'VAL' },
]

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation('common')
  const locale = useSettingsStore((s) => s.settings.locale)
  const setLocale = useSettingsStore((s) => s.setLocale)

  return (
    <div className={`lang-switch ${compact ? 'lang-switch--compact' : ''}`} role="group" aria-label={t('language')}>
      {LOCALES.map((l) => (
        <button
          key={l.code}
          type="button"
          className={locale === l.code ? 'is-active' : ''}
          onClick={() => void setLocale(l.code)}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
