import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { KOCH_ORDER, randomGroups } from '../curriculum/koch'
import { drawWeighted } from '../curriculum/sample'
import { randomWords } from '../content/words'
import { randomCallsigns } from '../content/callsigns'
import { QSO_SCRIPTS } from '../content/qsos'
import { CopyDrill, type DrillItem } from '../components/practice/CopyDrill'
import { useSettingsStore } from '../stores/settingsStore'
import { useProgressStore } from '../stores/progressStore'
import { nowIso } from '../data/types'

export function PracticeModePage() {
  const { mode = 'groups' } = useParams()
  const { t } = useTranslation(['practice', 'common'])
  const locale = useSettingsStore((s) => s.settings.locale)
  const settings = useSettingsStore((s) => s.settings)
  const characters = useProgressStore((s) => s.characters)
  const getWeakChars = useProgressStore((s) => s.getWeakChars)
  const recordSession = useProgressStore((s) => s.recordSession)
  const [seed, setSeed] = useState(() => Date.now())
  const [started, setStarted] = useState(false)

  const items = useMemo((): DrillItem[] => {
    const pool = KOCH_ORDER.map(String)
    if (mode === 'groups') {
      return randomGroups(pool, 12, 5).map((g) => ({ target: g }))
    }
    if (mode === 'words' || mode === 'headcopy') {
      return randomWords(locale, 12).map((w) => ({ target: w }))
    }
    if (mode === 'callsigns') {
      return randomCallsigns(10).map((c) => ({ target: c }))
    }
    if (mode === 'qso') {
      const script = QSO_SCRIPTS[Math.floor(Math.random() * QSO_SCRIPTS.length)]!
      return script.lines.map((line) => ({ target: line }))
    }
    if (mode === 'warmup') {
      const weak = getWeakChars(pool, 10)
      const focus = weak.length ? weak : pool.slice(0, 8)
      const weights = new Map<string, number>()
      for (const c of pool) {
        const ewma = characters[c]?.ewmaAccuracy ?? 0.5
        weights.set(c, 1 + (1 - ewma) * 3)
      }
      for (const c of focus) {
        weights.set(c, (weights.get(c) ?? 1) * 2)
      }
      return drawWeighted(pool, weights, 25).map((target) => ({ target }))
    }
    return randomGroups(pool, 10, 5).map((g) => ({ target: g }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, locale, seed])

  const title = t(`practice:modes.${mode}`, { defaultValue: mode })

  return (
    <div>
      <p>
        <Link className="back-link" to="/practice">
          {t('common:back')}
        </Link>
      </p>
      <header className="page-hero">
        <h1>{title}</h1>
        {mode === 'qso' ? (
          <p className="muted">{t('practice:qsoNotes.basic')}</p>
        ) : null}
      </header>

      {!started ? (
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => setStarted(true)}
        >
          {t('practice:startSession')}
        </button>
      ) : (
        <CopyDrill
          key={seed}
          items={items}
          passAccuracy={0.8}
          modeLabel={title}
          allowReveal
          retryLabel={t('practice:nextSession')}
          onRetry={() => setSeed(Date.now())}
          onComplete={(accuracy) => {
            void recordSession({
              mode: `practice:${mode}`,
              startedAt: nowIso(),
              endedAt: nowIso(),
              wpm: settings.effectiveWpm,
              accuracy,
              charsHeard: items.length,
            })
          }}
        />
      )}
    </div>
  )
}
