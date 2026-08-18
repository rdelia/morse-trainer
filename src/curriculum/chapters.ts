import { KOCH_ORDER } from './koch'

export interface ChapterDef {
  id: string
  /** i18n key under learn.chapters.<id> */
  titleKey: string
  order: number
  unlockAfterChapterId?: string
}

export interface LessonDef {
  id: string
  chapterId: string
  /** i18n key under learn.lessons.<id> */
  titleKey: string
  order: number
  kind: 'orientation' | 'koch' | 'numbers' | 'words' | 'prosigns' | 'callsigns' | 'qso' | 'hero'
  /** Koch ladder index (inclusive) when kind is koch */
  kochIndex?: number
  /** Characters for this lesson */
  chars?: string[]
  /** New characters to hear and explain before the quiz */
  introduce?: string[]
  /** Groups / items to practice */
  itemCount?: number
  passAccuracy?: number
  multipleChoice?: boolean
}

export const CHAPTERS: ChapterDef[] = [
  { id: 'orientation', titleKey: 'orientation', order: 0 },
  { id: 'first-sounds', titleKey: 'firstSounds', order: 1, unlockAfterChapterId: 'orientation' },
  { id: 'alphabet', titleKey: 'alphabet', order: 2, unlockAfterChapterId: 'first-sounds' },
  { id: 'numbers', titleKey: 'numbers', order: 3, unlockAfterChapterId: 'alphabet' },
  { id: 'words', titleKey: 'words', order: 4, unlockAfterChapterId: 'numbers' },
  { id: 'ham', titleKey: 'ham', order: 5, unlockAfterChapterId: 'words' },
  { id: 'callsigns', titleKey: 'callsigns', order: 6, unlockAfterChapterId: 'ham' },
  { id: 'qso', titleKey: 'qso', order: 7, unlockAfterChapterId: 'callsigns' },
  { id: 'hero', titleKey: 'hero', order: 8, unlockAfterChapterId: 'qso' },
]

function buildKochLessons(): LessonDef[] {
  const lessons: LessonDef[] = []
  // First sounds: first 5 Koch chars in a few lessons
  lessons.push({
    id: 'koch-01',
    chapterId: 'first-sounds',
    titleKey: 'koch01',
    order: 0,
    kind: 'koch',
    kochIndex: 1,
    chars: ['K', 'M'],
    introduce: ['K', 'M'],
    itemCount: 20,
    passAccuracy: 0.85,
    multipleChoice: true,
  })
  lessons.push({
    id: 'koch-02',
    chapterId: 'first-sounds',
    titleKey: 'koch02',
    order: 1,
    kind: 'koch',
    kochIndex: 4,
    chars: ['K', 'M', 'R', 'S', 'U'],
    introduce: ['R', 'S', 'U'],
    itemCount: 25,
    passAccuracy: 0.85,
    multipleChoice: true,
  })
  lessons.push({
    id: 'koch-03',
    chapterId: 'first-sounds',
    titleKey: 'koch03',
    order: 2,
    kind: 'koch',
    kochIndex: 4,
    chars: ['K', 'M', 'R', 'S', 'U'],
    itemCount: 30,
    passAccuracy: 0.9,
    multipleChoice: false,
  })

  // Alphabet: remaining Koch letters in steps of 2
  let order = 0
  for (let i = 5; i < KOCH_ORDER.length; i += 2) {
    const end = Math.min(i + 1, KOCH_ORDER.length - 1)
    const chars = KOCH_ORDER.slice(0, end + 1).map(String)
    const introduce = KOCH_ORDER.slice(i, end + 1).map(String)
    const isNumberHeavy = chars.some((c) => /\d/.test(c))
    const chapterId = isNumberHeavy && end >= 17 ? 'numbers' : 'alphabet'
    // Keep letter-focused lessons in alphabet until we hit digits heavily
    const useNumbersChapter = end >= 17
    lessons.push({
      id: `koch-${String(i).padStart(2, '0')}`,
      chapterId: useNumbersChapter ? 'numbers' : 'alphabet',
      titleKey: 'kochStep',
      order: order++,
      kind: useNumbersChapter ? 'numbers' : 'koch',
      kochIndex: end,
      chars,
      introduce,
      itemCount: 30,
      passAccuracy: 0.9,
      multipleChoice: false,
    })
    void chapterId
  }
  return lessons
}

export const LESSONS: LessonDef[] = [
  {
    id: 'orientation-2',
    chapterId: 'orientation',
    titleKey: 'orientation2',
    order: 0,
    kind: 'orientation',
    chars: ['E', 'T'],
    introduce: ['E', 'T'],
    itemCount: 10,
    passAccuracy: 0.7,
    multipleChoice: true,
  },
  ...buildKochLessons(),
  {
    id: 'words-1',
    chapterId: 'words',
    titleKey: 'words1',
    order: 0,
    kind: 'words',
    itemCount: 15,
    passAccuracy: 0.8,
  },
  {
    id: 'prosigns-1',
    chapterId: 'ham',
    titleKey: 'prosigns1',
    order: 0,
    kind: 'prosigns',
    chars: ['AR', 'SK', 'BT', 'KN'],
    introduce: ['AR', 'SK', 'BT', 'KN'],
    itemCount: 16,
    passAccuracy: 0.85,
    multipleChoice: true,
  },
  {
    id: 'callsigns-1',
    chapterId: 'callsigns',
    titleKey: 'callsigns1',
    order: 0,
    kind: 'callsigns',
    itemCount: 12,
    passAccuracy: 0.8,
  },
  {
    id: 'qso-1',
    chapterId: 'qso',
    titleKey: 'qso1',
    order: 0,
    kind: 'qso',
    itemCount: 1,
    passAccuracy: 0.7,
  },
  {
    id: 'hero-1',
    chapterId: 'hero',
    titleKey: 'hero1',
    order: 0,
    kind: 'hero',
    itemCount: 40,
    passAccuracy: 0.9,
  },
]

export function getLessonsForChapter(chapterId: string): LessonDef[] {
  return LESSONS.filter((l) => l.chapterId === chapterId).sort(
    (a, b) => a.order - b.order,
  )
}

export function getLesson(id: string): LessonDef | undefined {
  return LESSONS.find((l) => l.id === id)
}

export function getChapter(id: string): ChapterDef | undefined {
  return CHAPTERS.find((c) => c.id === id)
}

export function getNextLesson(lessonId: string): LessonDef | undefined {
  const current = getLesson(lessonId)
  if (!current) return undefined
  const inChapter = getLessonsForChapter(current.chapterId)
  const idx = inChapter.findIndex((l) => l.id === lessonId)
  const following = idx >= 0 ? inChapter[idx + 1] : undefined
  if (following) return following
  const nextChapter = CHAPTERS.find((c) => c.unlockAfterChapterId === current.chapterId)
  if (!nextChapter) return undefined
  return getLessonsForChapter(nextChapter.id)[0]
}
