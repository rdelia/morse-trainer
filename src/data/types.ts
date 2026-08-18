export type Locale = 'en' | 'it' | 'es' | 'fr' | 'ro' | 'ca-valencia'

export type LessonStatus = 'locked' | 'available' | 'completed'

export interface AppSettings {
  locale: Locale
  characterWpm: number
  effectiveWpm: number
  frequencyHz: number
  volume: number
  showMorseAfterAnswer: boolean
  devMode: boolean
}

export interface Profile {
  id: string
  displayName?: string
  createdAt: string
  updatedAt: string
}

export interface LessonProgress {
  id: string
  lessonId: string
  status: LessonStatus
  bestAccuracy: number
  attempts: number
  updatedAt: string
}

export interface CharacterStats {
  id: string
  char: string
  attempts: number
  correct: number
  ewmaAccuracy: number
  lastSeen: string
  updatedAt: string
}

export interface SessionRecord {
  id: string
  mode: string
  startedAt: string
  endedAt: string
  wpm: number
  accuracy: number
  charsHeard: number
  updatedAt: string
}

export interface UnlockState {
  id: string
  chapterId: string
  unlocked: boolean
  updatedAt: string
}

export interface ProgressSnapshot {
  profile: Profile
  settings: AppSettings
  lessons: LessonProgress[]
  characters: CharacterStats[]
  sessions: SessionRecord[]
  unlocks: UnlockState[]
  exportedAt: string
  version: 1
}

export const DEFAULT_SETTINGS: AppSettings = {
  locale: 'en',
  characterWpm: 18,
  effectiveWpm: 10,
  frequencyHz: 600,
  volume: 0.7,
  showMorseAfterAnswer: true,
  devMode: false,
}

export function newId(): string {
  return crypto.randomUUID()
}

export function nowIso(): string {
  return new Date().toISOString()
}
