import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CHAPTERS, LESSONS, getLessonsForChapter } from '../curriculum/chapters'
import { useProgressStore } from '../stores/progressStore'
import { useSettingsStore } from '../stores/settingsStore'

export function LearnPage() {
  const { t } = useTranslation(['learn', 'common'])
  const lessons = useProgressStore((s) => s.lessons)
  const isChapterUnlocked = useProgressStore((s) => s.isChapterUnlocked)
  const resetLearning = useProgressStore((s) => s.resetLearning)
  const devMode = useSettingsStore((s) => s.settings.devMode)

  const completedCount = LESSONS.filter(
    (l) => lessons[l.id]?.status === 'completed',
  ).length
  const hasProgress = completedCount > 0

  return (
    <div>
      <header className="page-hero">
        <h1>{t('learn:title')}</h1>
        <p className="lede muted">{t('learn:subtitle')}</p>
      </header>

      <div className="grid-2">
        {CHAPTERS.map((ch) => {
          const unlocked = devMode || isChapterUnlocked(ch.id)
          const chapterLessons = getLessonsForChapter(ch.id)
          const done = chapterLessons.filter(
            (l) => lessons[l.id]?.status === 'completed',
          ).length
          return (
            <div
              key={ch.id}
              className={`card-link ${unlocked ? '' : 'is-locked'}`}
              style={{ cursor: 'default' }}
            >
              <h3>
                {t(`learn:chapters.${ch.titleKey}`)}
                {!unlocked ? (
                  <span className="badge">{t('common:locked')}</span>
                ) : done === chapterLessons.length && chapterLessons.length > 0 ? (
                  <span className="badge badge--done">{t('common:completed')}</span>
                ) : null}
              </h3>
              <p>{t(`learn:chapterDesc.${ch.titleKey}`)}</p>
              {unlocked ? (
                <ul className="list-plain" style={{ marginTop: '0.75rem' }}>
                  {chapterLessons.map((l) => {
                    const completed = lessons[l.id]?.status === 'completed'
                    const title =
                      l.titleKey === 'kochStep'
                        ? t('learn:lessons.kochStep', {
                            chars: (l.chars ?? []).join(' '),
                          })
                        : t(`learn:lessons.${l.titleKey}`)
                    return (
                      <li key={l.id}>
                        <Link to={`/learn/${l.id}`}>
                          {title}
                          {completed ? (
                            <span className="badge badge--done">✓</span>
                          ) : null}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              ) : null}
            </div>
          )
        })}
      </div>

      {hasProgress ? (
        <div className="learn-restart">
          <button
            type="button"
            className="btn"
            onClick={() => {
              if (!confirm(t('learn:restartConfirm'))) return
              void resetLearning()
            }}
          >
            {t('learn:restart')}
          </button>
        </div>
      ) : null}
    </div>
  )
}
