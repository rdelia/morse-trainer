import { useTranslation } from 'react-i18next'
import { useProgressStore } from '../stores/progressStore'
import { LESSONS } from '../curriculum/chapters'
import { LETTERS } from '../morse/alphabet'

export function ProgressPage() {
  const { t } = useTranslation('progress')
  const lessons = useProgressStore((s) => s.lessons)
  const characters = useProgressStore((s) => s.characters)
  const recentSessions = useProgressStore((s) => s.recentSessions)

  const doneCount = LESSONS.filter((l) => lessons[l.id]?.status === 'completed').length
  const stats = Object.values(characters)
  const overall =
    stats.length === 0
      ? 0
      : stats.reduce((a, c) => a + c.ewmaAccuracy, 0) / stats.length

  const sorted = Object.keys(LETTERS)
    .map((ch) => ({ ch, s: characters[ch] }))
    .filter((x) => x.s)

  const strong = sorted
    .filter((x) => (x.s?.ewmaAccuracy ?? 0) >= 0.85)
    .sort((a, b) => (b.s?.ewmaAccuracy ?? 0) - (a.s?.ewmaAccuracy ?? 0))
  const weak = sorted
    .filter((x) => (x.s?.ewmaAccuracy ?? 1) < 0.7)
    .sort((a, b) => (a.s?.ewmaAccuracy ?? 0) - (b.s?.ewmaAccuracy ?? 0))

  return (
    <div>
      <header className="page-hero">
        <h1>{t('title')}</h1>
        <p className="lede muted">{t('subtitle')}</p>
      </header>

      <div className="grid-2" style={{ marginBottom: '2rem' }}>
        <div className="card-link" style={{ cursor: 'default' }}>
          <h3>{t('lessonsDone')}</h3>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', color: 'var(--amber)' }}>
            {doneCount} / {LESSONS.length}
          </p>
        </div>
        <div className="card-link" style={{ cursor: 'default' }}>
          <h3>{t('overall')}</h3>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '1.5rem', color: 'var(--teal)' }}>
            {(overall * 100).toFixed(0)}%
          </p>
        </div>
      </div>

      <h2>{t('mastered')}</h2>
      <p className="muted" style={{ fontFamily: 'var(--font-mono)' }}>
        {strong.length ? strong.map((x) => x.ch).join(' ') : '—'}
      </p>

      <h2 style={{ marginTop: '1.5rem' }}>{t('weak')}</h2>
      <p className="muted" style={{ fontFamily: 'var(--font-mono)' }}>
        {weak.length ? weak.map((x) => x.ch).join(' ') : '—'}
      </p>

      <h2 style={{ marginTop: '1.5rem' }}>{t('recent')}</h2>
      {recentSessions.length === 0 ? (
        <p className="muted">{t('noSessions')}</p>
      ) : (
        <ul className="list-plain">
          {recentSessions.map((s) => (
            <li key={s.id} style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
              {t('mode')}: {s.mode} · {(s.accuracy * 100).toFixed(0)}% · {s.wpm} WPM ·{' '}
              {t('charsHeard')}: {s.charsHeard}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
