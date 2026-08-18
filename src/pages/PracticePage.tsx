import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const MODES = [
  'groups',
  'words',
  'callsigns',
  'qso',
  'warmup',
  'headcopy',
] as const

export function PracticePage() {
  const { t } = useTranslation('practice')

  return (
    <div>
      <header className="page-hero">
        <h1>{t('title')}</h1>
        <p className="lede muted">{t('subtitle')}</p>
      </header>
      <div className="grid-2">
        {MODES.map((mode) => (
          <Link key={mode} className="card-link" to={`/practice/${mode}`}>
            <h3>{t(`modes.${mode}`)}</h3>
            <p>{t(`modes.${mode}Desc`)}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
