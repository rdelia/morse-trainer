import { hasMnemonic, MNEMONIC_MARKS, type MnemonicMark } from './mnemonicMarks'
import './MnemonicLetter.css'

const GLYPH = {
  x: 50,
  y: 98,
  textAnchor: 'middle' as const,
  fontSize: 100,
  fontWeight: 700,
  fontFamily: 'IBM Plex Sans, system-ui, sans-serif',
}

function Mark({ mark }: { mark: MnemonicMark }) {
  if (mark.kind === 'dot') {
    return (
      <circle
        className="mnemonic-letter__dot"
        cx={mark.cx}
        cy={mark.cy}
        r={mark.r ?? 4.5}
      />
    )
  }
  return (
    <line
      className="mnemonic-letter__dash"
      x1={mark.x1}
      y1={mark.y1}
      x2={mark.x2}
      y2={mark.y2}
      strokeLinecap="butt"
    />
  )
}

export function MnemonicLetter({
  char,
  label,
  compact,
}: {
  char: string
  label?: string
  compact?: boolean
}) {
  const upper = char.toUpperCase()
  const marks = MNEMONIC_MARKS[upper]

  if (!marks) {
    return (
      <p className="letter-intro__char" aria-label={label ?? char}>
        {char}
      </p>
    )
  }

  return (
    <div
      className={compact ? 'mnemonic-letter mnemonic-letter--compact' : 'mnemonic-letter'}
      aria-label={compact ? undefined : (label ?? char)}
      aria-hidden={compact || undefined}
    >
      <svg
        className="mnemonic-letter__svg"
        viewBox="0 0 100 120"
        role="img"
        aria-hidden
      >
        <text className="mnemonic-letter__glyph" {...GLYPH}>
          {upper}
        </text>
        {marks.map((mark, i) => (
          <Mark key={i} mark={mark} />
        ))}
      </svg>
    </div>
  )
}

export { hasMnemonic }
