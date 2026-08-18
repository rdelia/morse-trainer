import type { Locale } from '../../data/types'
import { drawBalanced } from '../../curriculum/sample'
import { WORDS_EN, WORDS_ES, WORDS_FR, WORDS_IT, WORDS_RO, WORDS_VA } from './lists'

const MAP: Record<Locale, string[]> = {
  en: WORDS_EN,
  it: WORDS_IT,
  es: WORDS_ES,
  fr: WORDS_FR,
  ro: WORDS_RO,
  'ca-valencia': WORDS_VA,
}

export function getWords(locale: Locale): string[] {
  return MAP[locale] ?? WORDS_EN
}

export function randomWords(locale: Locale, count: number): string[] {
  return drawBalanced(getWords(locale), count)
}
