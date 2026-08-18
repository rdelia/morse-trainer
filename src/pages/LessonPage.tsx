import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getLesson, getNextLesson } from '../curriculum/chapters'
import { KOCH_ORDER, randomGroups } from '../curriculum/koch'
import { drawBalanced, lessonBag, shuffle } from '../curriculum/sample'
import { randomWords } from '../content/words'
import { randomCallsigns } from '../content/callsigns'
import { QSO_SCRIPTS } from '../content/qsos'
import { CopyDrill, type DrillItem } from '../components/practice/CopyDrill'
import { LetterIntro } from '../components/learn/LetterIntro'
import { useSettingsStore } from '../stores/settingsStore'
import { useProgressStore } from '../stores/progressStore'
import { nowIso, type Locale } from '../data/types'

function withChoices(target: string, pool: string[], multipleChoice?: boolean): DrillItem {
  if (!multipleChoice) return { target }
  const others = shuffle(pool.filter((c) => c !== target)).slice(0, 3)
  return { target, choices: shuffle([target, ...others]) }
}

function buildItems(lessonId: string, locale: Locale): DrillItem[] {
  const lesson = getLesson(lessonId)
  if (!lesson) return []

  const count = lesson.itemCount ?? 20
  const chars = lesson.chars ?? []

  if (lesson.kind === 'orientation' || lesson.kind === 'koch' || lesson.kind === 'numbers') {
    const pool = chars.length ? chars : ['E']
    return drawBalanced(lessonBag(pool, lesson.introduce), count).map((target) =>
      withChoices(target, pool, lesson.multipleChoice),
    )
  }

  if (lesson.kind === 'words') {
    return randomWords(locale, count).map((w) => ({ target: w }))
  }

  if (lesson.kind === 'prosigns') {
    const pool = chars.length ? chars : ['AR', 'SK', 'BT', 'KN']
    return drawBalanced(lessonBag(pool, lesson.introduce), count).map((target) => ({
      ...withChoices(target, pool, lesson.multipleChoice),
      asProsign: true,
    }))
  }

  if (lesson.kind === 'callsigns') {
    return randomCallsigns(count).map((c) => ({ target: c }))
  }

  if (lesson.kind === 'qso') {
    const script = QSO_SCRIPTS[0]!
    return script.lines.map((line) => ({ target: line }))
  }

  if (lesson.kind === 'hero') {
    const pool = KOCH_ORDER.map(String)
    return randomGroups(pool, count, 5).map((g) => ({ target: g }))
  }

  return []
}

export function LessonPage() {
  const { lessonId = '' } = useParams()
  const { t } = useTranslation(['learn', 'common'])
  const locale = useSettingsStore((s) => s.settings.locale)
  const settings = useSettingsStore((s) => s.settings)
  const completeLesson = useProgressStore((s) => s.completeLesson)
  const recordSession = useProgressStore((s) => s.recordSession)
  const [seed, setSeed] = useState(() => Date.now())
  const [phase, setPhase] = useState<'intro' | 'drill'>('intro')

  const lesson = getLesson(lessonId)
  const items = useMemo(
    () => buildItems(lessonId, locale),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lessonId, locale, seed],
  )

  useEffect(() => {
    setPhase('intro')
  }, [lessonId])

  if (!lesson) {
    return (
      <p>
        <Link className="back-link" to="/learn">
          {t('common:back')}
        </Link>
      </p>
    )
  }

  const title =
    lesson.titleKey === 'kochStep'
      ? t('learn:lessons.kochStep', { chars: (lesson.chars ?? []).join(' ') })
      : t(`learn:lessons.${lesson.titleKey}`)

  const introduce = lesson.introduce ?? []
  const showIntro = phase === 'intro' && introduce.length > 0
  const nextLesson = getNextLesson(lesson.id)
  const nextTitle = nextLesson
    ? nextLesson.titleKey === 'kochStep'
      ? t('learn:lessons.kochStep', { chars: (nextLesson.chars ?? []).join(' ') })
      : t(`learn:lessons.${nextLesson.titleKey}`)
    : null

  return (
    <div>
      <p>
        <Link className="back-link" to="/learn">
          {t('common:back')}
        </Link>
      </p>
      <header className="page-hero">
        <h1>{title}</h1>
        {showIntro ? (
          <p className="muted">
            {lesson.kind === 'orientation' ? t('learn:demoHint') : t('learn:introLead')}
          </p>
        ) : lesson.itemCount === 1 ? null : (
          <p className="muted">
            {t('learn:passHint', {
              pct: Math.round((lesson.passAccuracy ?? 0.85) * 100),
            })}
          </p>
        )}
      </header>

      {showIntro ? (
        <LetterIntro
          chars={introduce}
          asProsign={lesson.kind === 'prosigns'}
          onDone={() => setPhase('drill')}
        />
      ) : (
        <CopyDrill
          key={`${lessonId}-${seed}`}
          items={items}
          passAccuracy={lesson.passAccuracy}
          modeLabel={title}
          nextTo={nextLesson ? `/learn/${nextLesson.id}` : '/learn'}
          nextLabel={
            nextLesson
              ? t('learn:nextLesson', { title: nextTitle })
              : t('learn:backToPath')
          }
          onRetry={() => {
            setSeed(Date.now())
            setPhase(introduce.length > 0 ? 'intro' : 'drill')
          }}
          onComplete={(accuracy) => {
            void (async () => {
              if (accuracy >= (lesson.passAccuracy ?? 0.85)) {
                await completeLesson(lesson.id, accuracy)
              }
              await recordSession({
                mode: `lesson:${lesson.id}`,
                startedAt: nowIso(),
                endedAt: nowIso(),
                wpm: settings.effectiveWpm,
                accuracy,
                charsHeard: items.length,
              })
            })()
          }}
        />
      )}
    </div>
  )
}
