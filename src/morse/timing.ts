export interface TimingConfig {
  /** Character speed in words per minute (PARIS standard) */
  characterWpm: number
  /** Effective overall speed (Farnsworth). If lower than characterWpm, gaps stretch. */
  effectiveWpm: number
}

export interface TimingMs {
  dit: number
  dah: number
  intraElement: number
  interCharacter: number
  interWord: number
}

/** Unit length at WPM: 1200 / wpm ms per dit (standard approximation) */
export function ditMs(wpm: number): number {
  return 1200 / Math.max(1, wpm)
}

export function computeTiming(config: TimingConfig): TimingMs {
  const charDit = ditMs(config.characterWpm)
  const eff = Math.min(config.effectiveWpm, config.characterWpm)
  const charUnit = charDit
  const dah = charUnit * 3
  const intraElement = charUnit

  // Farnsworth: stretch inter-character and inter-word gaps
  // Total time for "PARIS " at effective WPM vs character encoding time
  const parisUnitsAtChar = 50 // PARIS = 50 units including trailing word space at standard
  const timeForParisAtChar = parisUnitsAtChar * charDit
  const timeForParisAtEff = (60_000 / Math.max(1, eff)) // ms per word at effective
  const extra = Math.max(0, timeForParisAtEff - timeForParisAtChar)

  // Distribute extra across inter-char (4 gaps in PARIS) and one word space delta
  // Standard Farnsworth: keep element timing; inflate char/word spacing
  const standardInterChar = charUnit * 3
  const standardInterWord = charUnit * 7

  if (extra <= 0 || config.effectiveWpm >= config.characterWpm) {
    return {
      dit: charUnit,
      dah,
      intraElement,
      interCharacter: standardInterChar,
      interWord: standardInterWord,
    }
  }

  // Weight: word space gets more of the stretch
  const interCharacter = standardInterChar + extra * 0.15
  const interWord = standardInterWord + extra * 0.4

  return {
    dit: charUnit,
    dah,
    intraElement,
    interCharacter,
    interWord,
  }
}
