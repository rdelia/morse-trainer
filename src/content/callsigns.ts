const PREFIXES = ['W', 'K', 'N', 'A', 'F', 'I', 'G', 'M', 'VE', 'EA', 'IK', 'F']
const SUFFIX_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export function randomCallsign(): string {
  const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)]!
  const digit = String(Math.floor(Math.random() * 10))
  const len = 1 + Math.floor(Math.random() * 3)
  let suffix = ''
  for (let i = 0; i < len; i++) {
    suffix += SUFFIX_LETTERS[Math.floor(Math.random() * 26)]!
  }
  return `${prefix}${digit}${suffix}`
}

export function randomCallsigns(count: number): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  let guard = 0
  while (out.length < count && guard < count * 40) {
    guard += 1
    const next = randomCallsign()
    if (seen.has(next)) continue
    seen.add(next)
    out.push(next)
  }
  while (out.length < count) out.push(randomCallsign())
  return out
}
