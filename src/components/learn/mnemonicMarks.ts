/** Morse marks on IBM Plex Sans Bold. viewBox 0 0 100 120, baseline y=98.
 *  Layout follows the gray-letter / black-mark mnemonic table. */

export type MnemonicMark =
  | { kind: 'dot'; cx: number; cy: number; r?: number }
  | { kind: 'dash'; x1: number; y1: number; x2: number; y2: number }

function vDash(cx: number, y: number, h: number): MnemonicMark {
  return { kind: 'dash', x1: cx, y1: y, x2: cx, y2: y + h }
}

function hDash(x: number, cy: number, w: number): MnemonicMark {
  return { kind: 'dash', x1: x, y1: cy, x2: x + w, y2: cy }
}

function rDash(cx: number, cy: number, len: number, rot: number): MnemonicMark {
  const rad = (rot * Math.PI) / 180
  const dx = Math.cos(rad) * (len / 2)
  const dy = Math.sin(rad) * (len / 2)
  return { kind: 'dash', x1: cx - dx, y1: cy - dy, x2: cx + dx, y2: cy + dy }
}

export const MNEMONIC_MARKS: Record<string, MnemonicMark[]> = {
  // .-  dit at the apex, dah as the crossbar
  A: [
    { kind: 'dot', cx: 50, cy: 40 },
    hDash(33, 76, 34),
  ],
  // -...  dah on left stem, three dits down the bowls
  B: [
    { kind: 'dot', cx: 58, cy: 35 },
    vDash(32, 32, 62),
    { kind: 'dot', cx: 58, cy: 63 },
    { kind: 'dot', cx: 58, cy: 90 },
  ],
  // -.-.  dah down the upper-left, dit lower-left, dah along the bottom, dit at the right tip
  C: [
    rDash(31.2, 54.5, 23.7, 97.7),
    { kind: 'dot', cx: 33.6, cy: 82 },
    { kind: 'dot', cx: 68.9, cy: 87 },
    hDash(39.6, 91.1, 22.7),
  ],
  // -..  dah on the stem, two dits on the bowl
  D: [
    { kind: 'dot', cx: 68, cy: 42 },
    vDash(31, 36, 54),
    { kind: 'dot', cx: 68, cy: 84 },
  ],
  // .  dit on the middle bar
  E: [{ kind: 'dot', cx: 50, cy: 62 }],
  // ..-.  dits on the top bar, dah on the middle bar, dit at the foot of the stem
  F: [
    { kind: 'dot', cx: 36, cy: 36 },
    { kind: 'dot', cx: 65, cy: 36 },
    hDash(32, 62, 26),
    { kind: 'dot', cx: 36, cy: 88 },
  ],
  // --.  dah on the upper curve, dah along the bottom, dit on the spur
  G: [
    rDash(36.5, 42.5, 30, 124.2),
    hDash(40, 90, 30),
    { kind: 'dot', cx: 70, cy: 68 },
  ],
  // ....  one dit at each end of both stems
  H: [
    { kind: 'dot', cx: 28, cy: 36 },
    { kind: 'dot', cx: 72, cy: 36 },
    { kind: 'dot', cx: 72, cy: 89 },
    { kind: 'dot', cx: 28, cy: 89 },
  ],
  // ..
  I: [
    { kind: 'dot', cx: 50, cy: 34 },
    { kind: 'dot', cx: 50, cy: 90 },
  ],
  // .---  dit at the left of the hook, three dahs up the hook and stem
  J: [
    vDash(64, 31.2, 23.8),
    vDash(64, 62.3, 24.1),
    { kind: 'dot', cx: 35, cy: 86.3 },
    hDash(41, 90, 18),
  ],
  // -.-  dah on the upper arm, dit at the crotch, dah on the lower arm
  K: [
    rDash(51, 50, 20, -40),
    { kind: 'dot', cx: 30, cy: 66 },
    rDash(57, 74, 20, 42),
  ],
  // .-..  dit at the top, dah down the stem, two dits close together at the foot
  L: [
    { kind: 'dot', cx: 37, cy: 34 },
    vDash(37, 50, 34),
    { kind: 'dot', cx: 48, cy: 92 },
    { kind: 'dot', cx: 64, cy: 92 },
  ],
  // --  one dah centered on each outer stem
  M: [vDash(22, 44, 40), vDash(78, 44, 40)],
  // -.  dah on the diagonal, dit at the right foot
  N: [rDash(51, 65.2, 33, 60), { kind: 'dot', cx: 67.7, cy: 90.3 }],
  // ---  dahs on both shoulders and the bottom
  O: [rDash(71, 49.2, 22.4, 69.6), rDash(28, 49.2, 22.4, 111.1), hDash(38.8, 90.8, 21.6)],
  // .--.  dit at the top of the stem, dahs on both bars of the bowl, dit at the foot
  P: [
    { kind: 'dot', cx: 33, cy: 35 },
    hDash(39, 34, 24),
    hDash(32, 67, 30),
    { kind: 'dot', cx: 33, cy: 92 },
  ],
  // --.-  dashes flow down the left of the ring into the dot and the tail
  Q: [
    rDash(35, 40, 20, 126),
    vDash(30, 52, 20),
    { kind: 'dot', cx: 33, cy: 84 },
    vDash(53, 91, 20),
  ],
  // .-.  dit at the left foot, dah on the waist, dit at the right foot
  R: [
    hDash(34.5, 66.7, 27.2),
    { kind: 'dot', cx: 33.6, cy: 90.9 },
    { kind: 'dot', cx: 64.9, cy: 91.5 },
  ],
  // ...  three dits aligned down the middle of the S
  S: [
    { kind: 'dot', cx: 50, cy: 32 },
    { kind: 'dot', cx: 50, cy: 62 },
    { kind: 'dot', cx: 50, cy: 92 },
  ],
  // -
  T: [hDash(38.7, 34.7, 21.8)],
  // ..-  two dits stacked on the left stem, dah as the right stem
  U: [
    { kind: 'dot', cx: 30, cy: 42.7 },
    vDash(68, 36, 48),
    { kind: 'dot', cx: 30, cy: 69.2 },
  ],
  // ...-  three dits down the left, dah down the right
  V: [
    { kind: 'dot', cx: 29.9, cy: 34.4 },
    { kind: 'dot', cx: 37.5, cy: 59.1 },
    rDash(65.3, 60.1, 27.3, 106.9),
    { kind: 'dot', cx: 45, cy: 84.9 },
  ],
  // .--  dit on the first peak, dahs on the two rising strokes
  W: [
    { kind: 'dot', cx: 15, cy: 38 },
    rDash(40, 62, 36, -77),
    rDash(81, 62, 36, -77),
  ],
  // -..-  all four marks aligned on the top-left-to-bottom-right diagonal
  X: [
    rDash(36, 44, 22, 54),
    { kind: 'dot', cx: 47, cy: 59 },
    { kind: 'dot', cx: 53, cy: 67 },
    rDash(64, 82, 22, 54),
  ],
  // -.--  dah left arm, dit at the join, dah right arm, dah down the stem
  Y: [
    rDash(34.7, 43.3, 26.7, 65.1),
    rDash(62.8, 48.9, 27, 114.6),
    { kind: 'dot', cx: 46.2, cy: 62.6 },
    vDash(51.9, 69.2, 26.2),
  ],
  // --..  dah on the top bar, dah on the diagonal, two dits on the right of the foot
  Z: [
    hDash(29.1, 33.7, 26.1),
    rDash(50, 64, 27, 130),
    { kind: 'dot', cx: 54.7, cy: 90.4 },
    { kind: 'dot', cx: 68.3, cy: 90.8 },
  ],
}

export function hasMnemonic(ch: string): boolean {
  return Object.prototype.hasOwnProperty.call(MNEMONIC_MARKS, ch.toUpperCase())
}
