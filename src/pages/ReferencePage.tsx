import { useTranslation } from 'react-i18next'
import {
  DIGITS,
  LETTERS,
  PROSIGNS,
  PUNCTUATION,
  formatPattern,
} from '../morse/alphabet'
import { useMorsePlayer } from '../hooks/useMorsePlayer'
import { MnemonicLetter } from '../components/learn/MnemonicLetter'

function CharGrid({
  map,
  onPlay,
}: {
  map: Record<string, string>
  onPlay: (ch: string) => void
}) {
  return (
    <div className="ref-grid">
      {Object.entries(map).map(([ch, pat]) => (
        <button key={ch} type="button" className="ref-cell" onClick={() => onPlay(ch)}>
          <strong>{ch}</strong>
          <span>{formatPattern(pat)}</span>
        </button>
      ))}
    </div>
  )
}

export function ReferencePage() {
  const { t } = useTranslation('reference')
  const { playText, playProsign } = useMorsePlayer()

  return (
    <div>
      <header className="page-hero">
        <h1>{t('title')}</h1>
        <p className="lede muted">{t('subtitle')}</p>
        <p className="muted">{t('tapToHear')}</p>
      </header>

      <h2>{t('letters')}</h2>
      <CharGrid map={LETTERS} onPlay={(ch) => void playText(ch)} />

      <h2 style={{ marginTop: '1.75rem' }}>{t('digits')}</h2>
      <CharGrid map={DIGITS} onPlay={(ch) => void playText(ch)} />

      <h2 style={{ marginTop: '1.75rem' }}>{t('punctuation')}</h2>
      <CharGrid map={PUNCTUATION} onPlay={(ch) => void playText(ch)} />

      <h2 style={{ marginTop: '1.75rem' }}>{t('prosigns')}</h2>
      <div className="ref-grid">
        {Object.entries(PROSIGNS).map(([name, pat]) => (
          <button
            key={name}
            type="button"
            className="ref-cell"
            onClick={() => void playProsign(name)}
            title={t(`prosignNotes.${name}`, { defaultValue: name })}
          >
            <strong>{name}</strong>
            <span>{formatPattern(pat)}</span>
          </button>
        ))}
      </div>

      <h2 style={{ marginTop: '1.75rem' }}>{t('mnemonics')}</h2>
      <p className="muted">{t('mnemonicsHint')}</p>
      <div className="ref-mnemonics">
        {Object.keys(LETTERS).map((ch) => (
          <button
            key={ch}
            type="button"
            className="ref-mnemonic"
            onClick={() => void playText(ch)}
            aria-label={ch}
          >
            <MnemonicLetter char={ch} compact />
          </button>
        ))}
      </div>
    </div>
  )
}
