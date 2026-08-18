/** Fisher–Yates shuffle. Returns a new array. */
export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

/**
 * Draw `count` items from a bag. The bag is reshuffled when empty, so
 * frequencies stay even. Adjacent draws are different whenever the bag
 * has more than one distinct value.
 */
export function drawBalanced<T>(bagTemplate: readonly T[], count: number): T[] {
  if (count <= 0 || bagTemplate.length === 0) return []
  const unique = [...new Set(bagTemplate)]
  if (unique.length === 1) {
    return Array.from({ length: count }, () => unique[0]!)
  }

  const out: T[] = []
  let bag = shuffle(bagTemplate)

  while (out.length < count) {
    if (bag.length === 0) bag = shuffle(bagTemplate)
    const last = out[out.length - 1]
    let idx = bag.length - 1
    if (last !== undefined && bag[idx] === last) {
      const alt = bag.findIndex((x) => x !== last)
      if (alt >= 0) idx = alt
    }
    const [next] = bag.splice(idx, 1)
    out.push(next!)
  }
  return out
}

/** New characters get one extra slot so they show up more often, not only in streaks. */
export function lessonBag(pool: readonly string[], introduce: readonly string[] = []): string[] {
  if (!introduce.length) return [...pool]
  return [...pool, ...introduce]
}

export function pickDifferent<T>(pool: readonly T[], current: T | undefined): T {
  const opts =
    current === undefined ? pool : pool.filter((x) => x !== current)
  const from = opts.length ? opts : pool
  return from[Math.floor(Math.random() * from.length)]!
}

export function drawWeighted(
  chars: readonly string[],
  weights: Map<string, number>,
  count: number,
): string[] {
  const bag: string[] = []
  for (const c of chars) {
    const copies = Math.max(1, Math.round((weights.get(c) ?? 1) * 2))
    for (let i = 0; i < copies; i++) bag.push(c)
  }
  return drawBalanced(bag, count)
}
