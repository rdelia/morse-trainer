import { patternToChar } from './alphabet'
import { computeTiming, type TimingConfig } from './timing'

export interface DecoderResult {
  pattern: string
  char: string | undefined
}

/**
 * Decode key-down / key-up timings into Morse characters.
 * Thresholds follow the operator's actual sending, not only the WPM setting —
 * machine-tight gaps at high WPM would split letters between dits.
 */
export class MorseDecoder {
  private downAt: number | null = null
  private buffer = ''
  private timing: TimingConfig
  private onCharacter: (result: DecoderResult) => void
  private gapTimer: ReturnType<typeof setTimeout> | null = null
  private marks: number[] = []

  constructor(
    timing: TimingConfig,
    onCharacter: (result: DecoderResult) => void,
  ) {
    this.timing = timing
    this.onCharacter = onCharacter
  }

  updateTiming(timing: TimingConfig): void {
    this.timing = timing
  }

  keyDown(now = performance.now()): void {
    if (this.gapTimer) {
      clearTimeout(this.gapTimer)
      this.gapTimer = null
    }
    this.downAt = now
  }

  keyUp(now = performance.now()): void {
    if (this.downAt == null) return
    const held = now - this.downAt
    this.downAt = null
    this.noteMark(held)

    const unit = this.ditUnit()
    this.buffer += held >= unit * 2 ? '-' : '.'

    const charGap = Math.min(400, Math.max(150, unit * 2.5))
    this.gapTimer = setTimeout(() => this.flushChar(), charGap)
  }

  private noteMark(held: number): void {
    this.marks.push(held)
    if (this.marks.length > 12) this.marks.shift()
  }

  /** Estimated dit length from recent marks, with the WPM setting as a prior. */
  private ditUnit(): number {
    const configured = computeTiming(this.timing).dit
    if (this.marks.length === 0) return Math.max(configured, 60)

    const sorted = [...this.marks].sort((a, b) => a - b)
    const shortest = sorted[0]!
    const longest = sorted[sorted.length - 1]!

    if (longest > shortest * 1.8) {
      const mid = (shortest + longest) / 2
      const shorts = sorted.filter((m) => m < mid)
      const avg = shorts.reduce((a, b) => a + b, 0) / shorts.length
      return Math.max(35, avg)
    }

    // All marks similar: dahs if they look long vs configured dit, else dits
    if (shortest >= configured * 2.2) {
      return Math.max(35, configured, shortest / 3)
    }
    return Math.max(35, shortest)
  }

  private flushChar(): void {
    if (!this.buffer) return
    const pattern = this.buffer
    this.buffer = ''
    this.onCharacter({ pattern, char: patternToChar(pattern) })
  }

  reset(): void {
    this.buffer = ''
    this.downAt = null
    this.marks = []
    if (this.gapTimer) {
      clearTimeout(this.gapTimer)
      this.gapTimer = null
    }
  }
}
