/** ITU International Morse — language-independent patterns */

export type MorseSymbol = '.' | '-'

export const LETTERS: Record<string, string> = {
  A: '.-',
  B: '-...',
  C: '-.-.',
  D: '-..',
  E: '.',
  F: '..-.',
  G: '--.',
  H: '....',
  I: '..',
  J: '.---',
  K: '-.-',
  L: '.-..',
  M: '--',
  N: '-.',
  O: '---',
  P: '.--.',
  Q: '--.-',
  R: '.-.',
  S: '...',
  T: '-',
  U: '..-',
  V: '...-',
  W: '.--',
  X: '-..-',
  Y: '-.--',
  Z: '--..',
}

export const DIGITS: Record<string, string> = {
  '0': '-----',
  '1': '.----',
  '2': '..---',
  '3': '...--',
  '4': '....-',
  '5': '.....',
  '6': '-....',
  '7': '--...',
  '8': '---..',
  '9': '----.',
}

export const PUNCTUATION: Record<string, string> = {
  '.': '.-.-.-',
  ',': '--..--',
  '?': '..--..',
  '/': '-..-.',
  '=': '-...-',
  '+': '.-.-.',
}

/** Prosigns keyed by common display tokens */
export const PROSIGNS: Record<string, string> = {
  AR: '.-.-.',
  SK: '...-.-',
  BT: '-...-',
  KN: '-.--.',
  BK: '-...-.-',
}

const CHAR_MAP: Record<string, string> = {
  ...LETTERS,
  ...DIGITS,
  ...PUNCTUATION,
}

const PATTERN_TO_CHAR = new Map<string, string>()
for (const [ch, pat] of Object.entries(CHAR_MAP)) {
  PATTERN_TO_CHAR.set(pat, ch)
}

export function charToPattern(ch: string): string | undefined {
  const upper = ch.toUpperCase()
  if (PROSIGNS[upper]) return PROSIGNS[upper]
  return CHAR_MAP[upper]
}

export function patternToChar(pattern: string): string | undefined {
  return PATTERN_TO_CHAR.get(pattern)
}

export function patternToProsign(pattern: string): string | undefined {
  for (const [name, pat] of Object.entries(PROSIGNS)) {
    if (pat === pattern) return name
  }
  return undefined
}

export function formatPattern(pattern: string): string {
  return pattern.replace(/\./g, '·').replace(/-/g, '−')
}

/** Morse transcription of a word or line, with gaps between letters and words. */
export function textToFormattedMorse(text: string): string {
  const words = text.toUpperCase().replace(/\s+/g, ' ').trim().split(' ')
  return words
    .map((word) =>
      [...word]
        .map((ch) => {
          const p = charToPattern(ch)
          return p ? formatPattern(p) : ''
        })
        .filter(Boolean)
        .join(' '),
    )
    .filter(Boolean)
    .join('  /  ')
}

export function patternToSpoken(
  pattern: string,
  labels: { dot: string; dash: string },
): string {
  return [...pattern]
    .map((s) => (s === '.' ? labels.dot : labels.dash))
    .join(', ')
}

export function allTrainableChars(): string[] {
  return [
    ...Object.keys(LETTERS),
    ...Object.keys(DIGITS),
    ...Object.keys(PUNCTUATION),
  ]
}
