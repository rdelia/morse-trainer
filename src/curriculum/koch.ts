import { drawBalanced } from './sample'

/** Classic Koch character introduction order */
export const KOCH_ORDER = [
  'K',
  'M',
  'R',
  'S',
  'U',
  'A',
  'P',
  'T',
  'L',
  'O',
  'W',
  'I',
  '.',
  'N',
  'J',
  'E',
  'F',
  '0',
  'Y',
  ',',
  'V',
  'G',
  '5',
  '/',
  'Q',
  '9',
  'Z',
  'H',
  '3',
  '8',
  'B',
  '?',
  '4',
  '2',
  '7',
  'C',
  '1',
  'D',
  '6',
  'X',
  '=',
] as const

export type KochChar = (typeof KOCH_ORDER)[number]

export function kochCharsUpTo(indexInclusive: number): string[] {
  return KOCH_ORDER.slice(0, Math.max(0, indexInclusive + 1)).map(String)
}

export function randomGroups(
  chars: string[],
  groupCount: number,
  groupLen = 5,
): string[] {
  const letters = drawBalanced(chars, groupCount * groupLen)
  const groups: string[] = []
  for (let g = 0; g < groupCount; g++) {
    groups.push(letters.slice(g * groupLen, (g + 1) * groupLen).join(''))
  }
  return groups
}
