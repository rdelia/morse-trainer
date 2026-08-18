import { PROSIGNS, charToPattern } from './alphabet'
import { computeTiming, type TimingConfig } from './timing'

export type ToneEvent =
  | { type: 'on'; durationMs: number; char?: string }
  | { type: 'off'; durationMs: number }
  | { type: 'charEnd'; char: string }
  | { type: 'done' }

function patternToEvents(
  pattern: string,
  label: string,
  config: TimingConfig,
): ToneEvent[] {
  const t = computeTiming(config)
  const events: ToneEvent[] = []
  for (let j = 0; j < pattern.length; j++) {
    const sym = pattern[j]!
    events.push({
      type: 'on',
      durationMs: sym === '.' ? t.dit : t.dah,
      char: label,
    })
    if (j < pattern.length - 1) {
      events.push({ type: 'off', durationMs: t.intraElement })
    }
  }
  events.push({ type: 'charEnd', char: label })
  return events
}

export function textToEvents(text: string, config: TimingConfig): ToneEvent[] {
  const t = computeTiming(config)
  const events: ToneEvent[] = []
  const normalized = text.toUpperCase().replace(/\s+/g, ' ').trim()

  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized[i]!
    if (ch === ' ') {
      events.push({ type: 'off', durationMs: t.interWord })
      continue
    }

    const pattern = charToPattern(ch)
    if (!pattern) continue

    events.push(...patternToEvents(pattern, ch, config))

    const next = normalized[i + 1]
    if (next && next !== ' ') {
      events.push({ type: 'off', durationMs: t.interCharacter })
    }
  }

  events.push({ type: 'done' })
  return events
}

export function prosignToEvents(
  name: string,
  config: TimingConfig,
): ToneEvent[] {
  const key = name.toUpperCase()
  const pattern = PROSIGNS[key]
  if (!pattern) return [{ type: 'done' }]
  return [...patternToEvents(pattern, key, config), { type: 'done' }]
}
