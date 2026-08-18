import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { charToPattern, formatPattern, textToFormattedMorse } from '../../morse/alphabet'
import { useMorsePlayer } from '../../hooks/useMorsePlayer'
import { useSettingsStore } from '../../stores/settingsStore'
import { useProgressStore } from '../../stores/progressStore'
import { Visualizer } from './Visualizer'
import { ScoreToast } from './ScoreToast'
import './CopyDrill.css'

export interface DrillItem {
  /** What to play / expect (single char, prosign name, word, callsign, line) */
  target: string
  /** Play as prosign instead of letter-by-letter */
  asProsign?: boolean
  /** Options for multiple choice (single char) */
  choices?: string[]
}

interface CopyDrillProps {
  items: DrillItem[]
  passAccuracy?: number
  modeLabel: string
  onComplete: (accuracy: number) => void
  /** Practice aid: reveal the answer and Morse transcription */
  allowReveal?: boolean
  nextTo?: string
  nextLabel?: string
  onRetry?: () => void
  retryLabel?: string
}

export function CopyDrill({
  items,
  passAccuracy = 0.85,
  modeLabel,
  onComplete,
  allowReveal = false,
  nextTo,
  nextLabel,
  onRetry,
  retryLabel,
}: CopyDrillProps) {
  const { t } = useTranslation(['common', 'practice', 'learn'])
  const showMorse = useSettingsStore((s) => s.settings.showMorseAfterAnswer)
  const recordAnswer = useProgressStore((s) => s.recordAnswer)
  const { playText, playProsign, stop, playing, toneOn } = useMorsePlayer()

  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [answered, setAnswered] = useState(0)
  const [done, setDone] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [heard, setHeard] = useState(false)
  const nextButtonRef = useRef<HTMLButtonElement>(null)
  const playButtonRef = useRef<HTMLButtonElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const item = items[index]
  const accuracy = answered === 0 ? 0 : correctCount / answered
  const isSingleLetter = !!item && item.target.length === 1 && !item.asProsign

  useEffect(() => {
    return () => stop()
  }, [stop])

  useEffect(() => {
    if (feedback || revealed) {
      nextButtonRef.current?.focus()
    }
  }, [feedback, revealed])

  useEffect(() => {
    playButtonRef.current?.focus()
  }, [index])

  useEffect(() => {
    if (heard && item && !item.choices) {
      inputRef.current?.focus()
    }
  }, [heard, item])

  const transcription = useMemo(() => {
    if (!item) return ''
    if (item.asProsign) {
      const p = charToPattern(item.target)
      return p ? formatPattern(p) : ''
    }
    return textToFormattedMorse(item.target)
  }, [item])

  async function handlePlay() {
    if (!item) return
    setHeard(false)
    const completed = item.asProsign
      ? await playProsign(item.target)
      : await playText(item.target)
    if (completed) setHeard(true)
  }

  function normalize(s: string): string {
    return s.trim().toUpperCase().replace(/\s+/g, ' ')
  }

  async function submit(value: string) {
    if (!item || feedback || !heard) return
    const ok = normalize(value) === normalize(item.target)
    setFeedback(ok ? 'correct' : 'incorrect')
    setCorrectCount((c) => c + (ok ? 1 : 0))
    setAnswered((a) => a + 1)

    // Record per-character for single chars / prosigns
    if (item.target.length === 1 || item.asProsign) {
      await recordAnswer(item.target, ok)
    } else {
      for (const ch of item.target.replace(/\s/g, '')) {
        await recordAnswer(ch, ok)
      }
    }
  }

  function goNext() {
    if (index + 1 >= items.length) {
      const finalAcc = correctCount / Math.max(1, answered)
      setDone(true)
      onComplete(finalAcc)
      return
    }
    setIndex((i) => i + 1)
    setAnswer('')
    setFeedback(null)
    setRevealed(false)
    setHeard(false)
  }

  if (!item && !done) {
    return <p>{t('common:loading')}</p>
  }

  if (done) {
    const finalAcc = correctCount / Math.max(1, answered)
    const passed = finalAcc >= passAccuracy
    return (
      <div className="drill drill--done">
        <h2>{t('common:sessionDone')}</h2>
        <p className="drill__stat">
          {t('common:accuracy')}: {(finalAcc * 100).toFixed(0)}%
        </p>
        <p className={passed ? 'drill__pass' : 'drill__fail'}>
          {passed ? t('common:pass') : t('common:fail')}
        </p>
        {items.length === 1 ? null : (
          <p className="muted">
            {t('learn:passHint', { pct: Math.round(passAccuracy * 100) })}
          </p>
        )}
        <div className="cta-row" style={{ justifyContent: 'center' }}>
          {nextTo ? (
            <Link className="btn btn--primary" to={nextTo}>
              {nextLabel ?? t('common:next')}
            </Link>
          ) : null}
          {onRetry ? (
            <button
              type="button"
              className={nextTo ? 'btn' : 'btn btn--primary'}
              onClick={onRetry}
            >
              {retryLabel ?? t('common:tryAgain')}
            </button>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div className="drill">
      <div className="drill__meta">
        <span>{modeLabel}</span>
        <span>
          {index + 1} / {items.length}
        </span>
        <span>
          {t('common:accuracy')}: {(accuracy * 100).toFixed(0)}%
        </span>
      </div>

      <Visualizer active={toneOn} />

      <div className="drill__controls">
        <button
          type="button"
          ref={playButtonRef}
          className="btn btn--primary"
          onClick={() => void handlePlay()}
          disabled={playing}
        >
          {playing ? t('common:listen') : t('common:play')}
        </button>
        {playing && !isSingleLetter ? (
          <button type="button" className="btn" onClick={stop}>
            {t('common:stop')}
          </button>
        ) : null}
        {allowReveal && !revealed ? (
          <button type="button" className="btn" onClick={() => setRevealed(true)}>
            {t('practice:revealSolution')}
          </button>
        ) : null}
      </div>

      {revealed ? (
        <div className="drill__reveal">
          <p className="drill__reveal-label">{t('practice:solution')}</p>
          <p className="drill__reveal-text">{item!.target}</p>
          {transcription ? (
            <>
              <p className="drill__reveal-label">{t('practice:transcription')}</p>
              <p className="drill__reveal-morse">{transcription}</p>
            </>
          ) : null}
        </div>
      ) : null}

      {!revealed && !feedback && heard ? (
        item!.choices ? (
          <div className="drill__choices">
            <p className="muted">{t('common:chooseAnswer')}</p>
            <div className="choice-grid">
              {item!.choices.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="btn btn--choice"
                  onClick={() => void submit(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <form
            className="drill__form"
            onSubmit={(e) => {
              e.preventDefault()
              void submit(answer)
            }}
          >
            <label className="muted" htmlFor="answer">
              {t('common:typeAnswer')}
            </label>
            <input
              id="answer"
              ref={inputRef}
              className="drill__input"
              value={answer}
              autoComplete="off"
              autoCapitalize="characters"
              onChange={(e) => setAnswer(e.target.value.toUpperCase())}
            />
            <button type="submit" className="btn btn--primary" disabled={!answer}>
              {t('common:check')}
            </button>
          </form>
        )
      ) : null}

      <ScoreToast
        kind={feedback}
        pattern={showMorse && feedback && !revealed && transcription ? transcription : undefined}
      />

      {feedback || revealed ? (
        <div className="drill__next-row">
          <button type="button" ref={nextButtonRef} className="btn btn--primary" onClick={goNext}>
            {index + 1 >= items.length ? t('common:finish') : t('common:next')}
          </button>
        </div>
      ) : null}
    </div>
  )
}
