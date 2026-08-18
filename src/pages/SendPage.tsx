import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { charToPattern, formatPattern } from '../morse/alphabet'
import { MorseDecoder } from '../morse/decoder'
import { useSettingsStore } from '../stores/settingsStore'
import { KOCH_ORDER } from '../curriculum/koch'
import { pickDifferent } from '../curriculum/sample'

class Sidetone {
  private ctx: AudioContext | null = null
  private osc: OscillatorNode | null = null
  private gain: GainNode | null = null
  private keyed = false

  private ensureGraph(frequencyHz: number): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext()
      this.gain = this.ctx.createGain()
      this.gain.gain.value = 0
      this.gain.connect(this.ctx.destination)
      this.osc = this.ctx.createOscillator()
      this.osc.type = 'sine'
      this.osc.frequency.value = frequencyHz
      this.osc.connect(this.gain)
      this.osc.start()
    } else if (this.osc) {
      this.osc.frequency.setValueAtTime(frequencyHz, this.ctx.currentTime)
    }
    return this.ctx
  }

  start(frequencyHz: number, volume: number): void {
    this.keyed = true
    const ctx = this.ensureGraph(frequencyHz)
    if (ctx.state === 'suspended') {
      void ctx.resume().then(() => {
        if (this.keyed) this.applyGain(volume)
      })
    }
    this.applyGain(volume)
  }

  stop(): void {
    this.keyed = false
    if (!this.ctx || !this.gain) return
    const now = this.ctx.currentTime
    const g = this.gain.gain
    const current = Math.max(g.value, 0.0001)
    g.cancelScheduledValues(now)
    g.setValueAtTime(current, now)
    g.linearRampToValueAtTime(0.0001, now + 0.012)
    g.setValueAtTime(0, now + 0.013)
  }

  destroy(): void {
    this.keyed = false
    if (this.ctx && this.gain) {
      const now = this.ctx.currentTime
      const g = this.gain.gain
      const current = Math.max(g.value, 0.0001)
      g.cancelScheduledValues(now)
      g.setValueAtTime(current, now)
      g.linearRampToValueAtTime(0.0001, now + 0.012)
      g.setValueAtTime(0, now + 0.013)
    }
    const ctx = this.ctx
    const osc = this.osc
    const gain = this.gain
    this.osc = null
    this.gain = null
    this.ctx = null
    // Stop after release so mobile doesn't click
    window.setTimeout(() => {
      try {
        osc?.stop()
      } catch {
        /* */
      }
      osc?.disconnect()
      gain?.disconnect()
      void ctx?.close()
    }, 30)
  }

  private applyGain(volume: number): void {
    if (!this.ctx || !this.gain || !this.keyed) return
    const now = this.ctx.currentTime
    const vol = Math.max(0, Math.min(1, volume)) * 0.35
    const g = this.gain.gain
    g.cancelScheduledValues(now)
    g.setValueAtTime(g.value, now)
    g.linearRampToValueAtTime(vol, now + 0.008)
  }
}

export function SendPage() {
  const { t } = useTranslation('send')
  const settings = useSettingsStore((s) => s.settings)
  const [decoded, setDecoded] = useState('')
  const [down, setDown] = useState(false)
  const [target, setTarget] = useState(() => pickDifferent(KOCH_ORDER.slice(0, 10), undefined))
  const [match, setMatch] = useState(false)
  const [muted, setMuted] = useState(false)
  const [showCode, setShowCode] = useState(false)

  const targetPattern = charToPattern(target)

  const decoderRef = useRef<MorseDecoder | null>(null)
  const sidetoneRef = useRef(new Sidetone())
  const downRef = useRef(false)
  const mutedRef = useRef(false)
  const targetRef = useRef(target)
  targetRef.current = target
  mutedRef.current = muted

  useEffect(() => {
    const timing = {
      characterWpm: settings.characterWpm,
      effectiveWpm: settings.effectiveWpm,
    }
    decoderRef.current = new MorseDecoder(timing, ({ char }) => {
      if (!char) return
      setDecoded((d) => {
        const next = d + char
        setMatch(next.endsWith(targetRef.current))
        return next
      })
    })
    return () => sidetoneRef.current.destroy()
  }, [])

  useEffect(() => {
    decoderRef.current?.updateTiming({
      characterWpm: settings.characterWpm,
      effectiveWpm: settings.effectiveWpm,
    })
  }, [settings.characterWpm, settings.effectiveWpm])

  const startKey = useCallback(() => {
    if (downRef.current) return
    downRef.current = true
    setDown(true)
    decoderRef.current?.keyDown()
    if (!mutedRef.current) {
      sidetoneRef.current.start(settings.frequencyHz, settings.volume)
    }
  }, [settings.frequencyHz, settings.volume])

  const toggleMute = useCallback(() => {
    const next = !mutedRef.current
    mutedRef.current = next
    setMuted(next)
    if (next) {
      sidetoneRef.current.stop()
    } else if (downRef.current) {
      sidetoneRef.current.start(settings.frequencyHz, settings.volume)
    }
  }, [settings.frequencyHz, settings.volume])

  const endKey = useCallback(() => {
    if (!downRef.current) return
    downRef.current = false
    setDown(false)
    decoderRef.current?.keyUp()
    sidetoneRef.current.stop()
  }, [])

  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat) return
      e.preventDefault()
      startKey()
    }
    const onUp = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return
      e.preventDefault()
      endKey()
    }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [startKey, endKey])

  return (
    <div>
      <header className="page-hero">
        <h1>{t('title')}</h1>
        <p className="lede muted">{t('subtitle')}</p>
        <p className="muted">{t('hint')}</p>
      </header>

      <p>{t('targetPrompt', { target })}</p>
      {showCode && targetPattern ? (
        <p className="send-code">
          <span className="muted">{t('code', { target })}</span>
          <strong>{formatPattern(targetPattern)}</strong>
        </p>
      ) : null}
      <div className="cta-row">
        <button
          type="button"
          className="btn"
          onClick={() => {
            setTarget(pickDifferent(KOCH_ORDER.slice(0, 15), target))
            setDecoded('')
            setMatch(false)
            setShowCode(false)
            decoderRef.current?.reset()
          }}
        >
          {t('newTarget')}
        </button>
        <button
          type="button"
          className="btn"
          aria-pressed={showCode}
          onClick={() => setShowCode((s) => !s)}
        >
          {showCode ? t('hideCode') : t('showCode')}
        </button>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setDecoded('')
            setMatch(false)
            decoderRef.current?.reset()
          }}
        >
          {t('clear')}
        </button>
        <button
          type="button"
          className="btn"
          aria-pressed={muted}
          onClick={toggleMute}
        >
          {muted ? t('unmute') : t('mute')}
        </button>
      </div>

      <p className="muted" style={{ marginTop: '1.5rem' }}>
        {t('decoded')}
      </p>
      <p className="decoded-out">{decoded || '—'}</p>
      {match ? <p style={{ color: 'var(--teal)' }}>{t('match')}</p> : null}

      <button
        type="button"
        className={`paddle ${down ? 'is-down' : ''}`}
        style={{ marginTop: '1.5rem' }}
        onPointerDown={(e) => {
          e.preventDefault()
          ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
          startKey()
        }}
        onPointerUp={endKey}
        onPointerCancel={endKey}
      >
        {t('hold')}
      </button>
    </div>
  )
}
