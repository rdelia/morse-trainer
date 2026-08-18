import { textToEvents, prosignToEvents, type ToneEvent } from './scheduler'
import type { TimingConfig } from './timing'

export interface AudioPlayerOptions {
  frequencyHz: number
  volume: number
  timing: TimingConfig
  onEvent?: (event: ToneEvent) => void
  onPlayingChange?: (playing: boolean) => void
}

/** Soft attack/release — abrupt gain or osc.stop() clicks badly on mobile */
const ATTACK_S = 0.008
const RELEASE_S = 0.012
const PEAK_SCALE = 0.35

export class MorseAudioPlayer {
  private ctx: AudioContext | null = null
  private gain: GainNode | null = null
  private osc: OscillatorNode | null = null
  private timer: ReturnType<typeof setTimeout> | null = null
  private queue: ToneEvent[] = []
  private cancelled = false
  private options: AudioPlayerOptions
  private resolvePlay: ((completed: boolean) => void) | null = null
  private playId = 0

  constructor(options: AudioPlayerOptions) {
    this.options = options
  }

  updateOptions(partial: Partial<AudioPlayerOptions>): void {
    this.options = { ...this.options, ...partial }
    if (this.ctx && this.osc) {
      this.osc.frequency.setValueAtTime(
        this.options.frequencyHz,
        this.ctx.currentTime,
      )
    }
  }

  private async ensureContext(): Promise<AudioContext> {
    if (!this.ctx) {
      const Ctx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext
      this.ctx = new Ctx()
      this.gain = this.ctx.createGain()
      this.gain.gain.value = 0
      this.gain.connect(this.ctx.destination)

      // Continuous oscillator; gate with gain only (no stop/start clicks)
      this.osc = this.ctx.createOscillator()
      this.osc.type = 'sine'
      this.osc.frequency.value = this.options.frequencyHz
      this.osc.connect(this.gain)
      this.osc.start()
    }
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume()
    }
    return this.ctx
  }

  private peakVolume(): number {
    return Math.max(0, Math.min(1, this.options.volume)) * PEAK_SCALE
  }

  private setTone(on: boolean): void {
    if (!this.ctx || !this.gain) return
    const now = this.ctx.currentTime
    const g = this.gain.gain
    const current = g.value

    g.cancelScheduledValues(now)
    g.setValueAtTime(current, now)

    if (on) {
      g.linearRampToValueAtTime(this.peakVolume(), now + ATTACK_S)
    } else {
      const from = Math.max(current, 0.0001)
      g.setValueAtTime(from, now)
      g.linearRampToValueAtTime(0.0001, now + RELEASE_S)
      g.setValueAtTime(0, now + RELEASE_S + 0.001)
    }
  }

  private silenceNow(): void {
    if (!this.ctx || !this.gain) return
    const now = this.ctx.currentTime
    const g = this.gain.gain
    const current = Math.max(g.value, 0.0001)
    g.cancelScheduledValues(now)
    g.setValueAtTime(current, now)
    g.linearRampToValueAtTime(0.0001, now + RELEASE_S)
    g.setValueAtTime(0, now + RELEASE_S + 0.001)
  }

  async playText(text: string): Promise<boolean> {
    const events = textToEvents(text, this.options.timing)
    return this.playEvents(events)
  }

  async playProsign(name: string): Promise<boolean> {
    const events = prosignToEvents(name, this.options.timing)
    return this.playEvents(events)
  }

  async playEvents(events: ToneEvent[]): Promise<boolean> {
    this.cancel()
    const id = this.playId
    this.cancelled = false
    await this.ensureContext()
    // A newer playEvents() call may have superseded this one while we were
    // awaiting context (e.g. rapid repeat clicks) - bail out without
    // touching any shared state that now belongs to that newer call.
    if (id !== this.playId) return false
    this.queue = [...events]
    this.options.onPlayingChange?.(true)

    return new Promise((resolve) => {
      this.resolvePlay = (completed) => resolve(completed)
      const step = () => {
        if (id !== this.playId) {
          resolve(false)
          return
        }
        if (this.cancelled) {
          this.finishPlayback(false)
          return
        }
        const event = this.queue.shift()
        if (!event) {
          this.finishPlayback(true)
          return
        }
        this.options.onEvent?.(event)
        if (event.type === 'on') {
          this.setTone(true)
          this.timer = setTimeout(step, event.durationMs)
        } else if (event.type === 'off') {
          this.setTone(false)
          this.timer = setTimeout(step, event.durationMs)
        } else if (event.type === 'charEnd') {
          step()
        } else if (event.type === 'done') {
          this.finishPlayback(true)
        }
      }
      step()
    })
  }

  private finishPlayback(completed: boolean): void {
    this.silenceNow()
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
    this.queue = []
    this.options.onPlayingChange?.(false)
    const done = this.resolvePlay
    this.resolvePlay = null
    done?.(completed)
  }

  cancel(): void {
    this.playId++
    this.cancelled = true
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
    this.queue = []
    this.silenceNow()
    this.options.onPlayingChange?.(false)
    const done = this.resolvePlay
    this.resolvePlay = null
    done?.(false)
  }

  destroy(): void {
    this.cancel()
    try {
      this.osc?.stop()
    } catch {
      /* already stopped */
    }
    this.osc?.disconnect()
    this.gain?.disconnect()
    void this.ctx?.close()
    this.osc = null
    this.gain = null
    this.ctx = null
  }
}
