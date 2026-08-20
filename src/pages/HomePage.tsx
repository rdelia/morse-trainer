import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CHAPTERS, LESSONS, getLessonsForChapter } from '../curriculum/chapters'
import { useProgressStore } from '../stores/progressStore'
import { useSettingsStore } from '../stores/settingsStore'

export function HomePage() {
  const { t } = useTranslation('common')
  const lessons = useProgressStore((s) => s.lessons)
  const isChapterUnlocked = useProgressStore((s) => s.isChapterUnlocked)
  const devMode = useSettingsStore((s) => s.settings.devMode)

  let continueTo = '/learn'
  for (const ch of CHAPTERS) {
    if (!(devMode || isChapterUnlocked(ch.id))) continue
    const chapterLessons = getLessonsForChapter(ch.id)
    const next = chapterLessons.find((l) => lessons[l.id]?.status !== 'completed')
    if (next) {
      continueTo = `/learn/${next.id}`
      break
    }
  }

  const doneCount = LESSONS.filter((l) => lessons[l.id]?.status === 'completed').length
  const isNewVisitor = doneCount === 0

  return (
    <section className="page-hero page-backdrop">
      <p className="brand-hero">{t('brand')}</p>
      <p className="lede">{t('tagline')}</p>

      {isNewVisitor ? (
        <div className="onboard-steps">
          <div className="onboard-step">
            <span className="onboard-step__num">1</span>
            <h3>{t('onboard.hearTitle')}</h3>
            <p className="muted">{t('onboard.hearBody')}</p>
          </div>
          <div className="onboard-step">
            <span className="onboard-step__num">2</span>
            <h3>{t('onboard.knowTitle')}</h3>
            <p className="muted">{t('onboard.knowBody')}</p>
          </div>
          <div className="onboard-step">
            <span className="onboard-step__num">3</span>
            <h3>{t('onboard.sendTitle')}</h3>
            <p className="muted">{t('onboard.sendBody')}</p>
          </div>
        </div>
      ) : null}

      <div className="cta-row">
        <Link className="btn btn--primary" to={continueTo}>
          {doneCount > 0 ? t('continue') : t('start')}
        </Link>
        <Link className="btn" to="/practice">
          {t('nav.practice')}
        </Link>
        <Link className="btn" to="/wiki">
          {t('nav.wiki')}
        </Link>
      </div>
    </section>
  )
}
