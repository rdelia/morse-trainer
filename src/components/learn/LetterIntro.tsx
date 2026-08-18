import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { charToPattern, formatPattern, patternToSpoken } from '../../morse/alphabet'
import { useMorsePlayer } from '../../hooks/useMorsePlayer'
import { Visualizer } from '../practice/Visualizer'
import { hasMnemonic, MnemonicLetter } from './MnemonicLetter'
import './LetterIntro.css'

interface LetterIntroProps {
  chars: string[]
  asProsign?: boolean
  onDone: () => void
  doneLabel?: string
}

export function LetterIntro({ chars, asProsign, onDone, doneLabel }: LetterIntroProps) {
  const { t } = useTranslation(['learn', 'common'])
  const { playText, playProsign, stop, playing, toneOn } = useMorsePlayer()
  const [index, setIndex] = useState(0)
  const ch = chars[index]
  const pattern = ch ? charToPattern(ch) : undefined
  const spoken = pattern
    ? patternToSpoken(pattern, {
        dot: t('common:dot'),
        dash: t('common:dash'),
      })
    : ''

  useEffect(() => {
    return () => stop()
  }, [stop])

  useEffect(() => {
    stop()
  }, [index, stop])

  async function handlePlay() {
    if (!ch) return
    if (asProsign) await playProsign(ch)
    else await playText(ch)
  }

  function explanation(): string {
    if (!ch || !pattern) return ''
    if (pattern === '.') return t('learn:introOneDot', { letter: ch })
    if (pattern === '-') return t('learn:introOneDash', { letter: ch })
    return t('learn:introPattern', { letter: ch, spoken })
  }

  function goNext() {
    stop()
    if (index + 1 >= chars.length) {
      onDone()
      return
    }
    setIndex((i) => i + 1)
  }

  function goTo(next: number) {
    stop()
    setIndex(Math.max(0, Math.min(chars.length - 1, next)))
  }

  if (!ch) return null

  const last = index + 1 >= chars.length
  const many = chars.length > 1

  return (
    <div className="letter-intro">
      <div className="letter-intro__meta">
        <span>{t('learn:introTitle')}</span>
        <span>
          {index + 1} / {chars.length}
        </span>
      </div>

      <Visualizer active={toneOn} />

      <MnemonicLetter char={ch} label={ch} />
      {pattern && !hasMnemonic(ch) ? (
        <p className="letter-intro__marks" aria-hidden>
          {formatPattern(pattern)}
        </p>
      ) : null}
      <p className="letter-intro__explain">{explanation()}</p>
      <p className="muted">{t('learn:introListen', { letter: ch })}</p>

      <div className="letter-intro__controls">
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => void handlePlay()}
          disabled={playing}
        >
          {playing ? t('common:listen') : t('common:play')}
        </button>
      </div>

      {many ? (
        <div className="letter-intro__steps" role="tablist" aria-label={t('learn:introTitle')}>
          {chars.map((c, i) => (
            <button
              key={`${c}-${i}`}
              type="button"
              role="tab"
              aria-selected={i === index}
              className={`letter-intro__step ${i === index ? 'is-current' : ''}`}
              onClick={() => goTo(i)}
            >
              {c}
            </button>
          ))}
        </div>
      ) : null}

      <div className="letter-intro__nav">
        {many ? (
          <button
            type="button"
            className="btn"
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
          >
            {t('learn:prevLetter')}
          </button>
        ) : null}
        <button type="button" className="btn btn--primary" onClick={goNext}>
          {last ? doneLabel ?? t('learn:startPractice') : t('learn:nextLetter')}
        </button>
        {last ? null : (
          <button
            type="button"
            className="btn"
            onClick={() => {
              stop()
              onDone()
            }}
          >
            {t('learn:skipIntro')}
          </button>
        )}
      </div>
    </div>
  )
}
