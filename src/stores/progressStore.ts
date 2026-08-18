import { create } from 'zustand'
import { progressRepo } from '../data/idbProgressRepository'
import {
  newId,
  nowIso,
  type CharacterStats,
  type LessonProgress,
  type SessionRecord,
  type UnlockState,
} from '../data/types'
import { CHAPTERS, LESSONS } from '../curriculum/chapters'
import { useSettingsStore } from './settingsStore'

interface ProgressState {
  lessons: Record<string, LessonProgress>
  characters: Record<string, CharacterStats>
  unlocks: Record<string, UnlockState>
  recentSessions: SessionRecord[]
  hydrated: boolean
  hydrate: () => Promise<void>
  recordAnswer: (char: string, correct: boolean) => Promise<void>
  completeLesson: (lessonId: string, accuracy: number) => Promise<void>
  recordSession: (partial: Omit<SessionRecord, 'id' | 'updatedAt'>) => Promise<void>
  isChapterUnlocked: (chapterId: string) => boolean
  getWeakChars: (pool: string[], limit?: number) => string[]
  refresh: () => Promise<void>
  resetLearning: () => Promise<void>
}

function ewma(prev: number, sample: number, alpha = 0.25): number {
  return prev * (1 - alpha) + sample * alpha
}

let hydrateInFlight: Promise<void> | null = null

export const useProgressStore = create<ProgressState>((set, get) => ({
  lessons: {},
  characters: {},
  unlocks: {},
  recentSessions: [],
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return
    if (hydrateInFlight) return hydrateInFlight
    hydrateInFlight = (async () => {
      const [lessons, characters, unlocks, sessions] = await Promise.all([
        progressRepo.getAllLessonProgress(),
        progressRepo.getAllCharacterStats(),
        progressRepo.getAllUnlocks(),
        progressRepo.getRecentSessions(20),
      ])

      // Ensure orientation unlocked
      const unlockMap: Record<string, UnlockState> = {}
      for (const u of unlocks) unlockMap[u.chapterId] = u
      if (!unlockMap['orientation']) {
        const u: UnlockState = {
          id: newId(),
          chapterId: 'orientation',
          unlocked: true,
          updatedAt: nowIso(),
        }
        await progressRepo.upsertUnlock(u)
        unlockMap['orientation'] = u
      }

      const lessonMap: Record<string, LessonProgress> = {}
      for (const l of lessons) lessonMap[l.lessonId] = l

      const charMap: Record<string, CharacterStats> = {}
      for (const c of characters) charMap[c.char] = c

      set({
        lessons: lessonMap,
        characters: charMap,
        unlocks: unlockMap,
        recentSessions: sessions,
        hydrated: true,
      })
    })().finally(() => {
      hydrateInFlight = null
    })
    return hydrateInFlight
  },

  refresh: async () => {
    set({ hydrated: false })
    await get().hydrate()
  },

  resetLearning: async () => {
    await progressRepo.clearProgress()
    const u: UnlockState = {
      id: newId(),
      chapterId: 'orientation',
      unlocked: true,
      updatedAt: nowIso(),
    }
    await progressRepo.upsertUnlock(u)
    set({
      lessons: {},
      characters: {},
      unlocks: { orientation: u },
      recentSessions: [],
      hydrated: true,
    })
  },

  recordAnswer: async (char, correct) => {
    const key = char.toUpperCase()
    const existing = get().characters[key]
    const attempts = (existing?.attempts ?? 0) + 1
    const correctCount = (existing?.correct ?? 0) + (correct ? 1 : 0)
    const sample = correct ? 1 : 0
    const prev = existing?.ewmaAccuracy ?? 0.5
    const stats: CharacterStats = {
      id: existing?.id ?? newId(),
      char: key,
      attempts,
      correct: correctCount,
      ewmaAccuracy: ewma(prev, sample),
      lastSeen: nowIso(),
      updatedAt: nowIso(),
    }
    await progressRepo.upsertCharacterStats(stats)
    set((s) => ({ characters: { ...s.characters, [key]: stats } }))
  },

  completeLesson: async (lessonId, accuracy) => {
    const existing = get().lessons[lessonId]
    const progress: LessonProgress = {
      id: existing?.id ?? newId(),
      lessonId,
      status: 'completed',
      bestAccuracy: Math.max(existing?.bestAccuracy ?? 0, accuracy),
      attempts: (existing?.attempts ?? 0) + 1,
      updatedAt: nowIso(),
    }
    await progressRepo.upsertLessonProgress(progress)

    // Unlock next chapter if all lessons in current chapter completed
    const lesson = LESSONS.find((l) => l.id === lessonId)
    if (lesson) {
      const chapterLessons = LESSONS.filter((l) => l.chapterId === lesson.chapterId)
      const lessonMap = { ...get().lessons, [lessonId]: progress }
      const allDone = chapterLessons.every(
        (l) => lessonMap[l.id]?.status === 'completed',
      )
      if (allDone) {
        const next = CHAPTERS.find((c) => c.unlockAfterChapterId === lesson.chapterId)
        if (next) {
          const u: UnlockState = {
            id: get().unlocks[next.id]?.id ?? newId(),
            chapterId: next.id,
            unlocked: true,
            updatedAt: nowIso(),
          }
          await progressRepo.upsertUnlock(u)
          set((s) => ({
            lessons: lessonMap,
            unlocks: { ...s.unlocks, [next.id]: u },
          }))
          return
        }
      }
    }

    set((s) => ({ lessons: { ...s.lessons, [lessonId]: progress } }))
  },

  recordSession: async (partial) => {
    const session: SessionRecord = {
      ...partial,
      id: newId(),
      updatedAt: nowIso(),
    }
    await progressRepo.addSession(session)
    set((s) => ({
      recentSessions: [session, ...s.recentSessions].slice(0, 20),
    }))
  },

  isChapterUnlocked: (chapterId) => {
    if (useSettingsStore.getState().settings.devMode) return true
    const chapter = CHAPTERS.find((c) => c.id === chapterId)
    if (!chapter) return false
    if (!chapter.unlockAfterChapterId) return true
    return get().unlocks[chapterId]?.unlocked === true
  },

  getWeakChars: (pool, limit = 8) => {
    const { characters } = get()
    return [...pool]
      .sort((a, b) => {
        const wa = characters[a]?.ewmaAccuracy ?? 0.4
        const wb = characters[b]?.ewmaAccuracy ?? 0.4
        return wa - wb
      })
      .slice(0, limit)
  },
}))
