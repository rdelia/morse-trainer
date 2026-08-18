import type {
  AppSettings,
  CharacterStats,
  LessonProgress,
  Profile,
  ProgressSnapshot,
  SessionRecord,
  UnlockState,
} from './types'

export interface ProgressRepository {
  getProfile(): Promise<Profile>
  getSettings(): Promise<AppSettings>
  saveSettings(settings: AppSettings): Promise<void>
  getLessonProgress(lessonId: string): Promise<LessonProgress | undefined>
  getAllLessonProgress(): Promise<LessonProgress[]>
  upsertLessonProgress(progress: LessonProgress): Promise<void>
  getCharacterStats(char: string): Promise<CharacterStats | undefined>
  getAllCharacterStats(): Promise<CharacterStats[]>
  upsertCharacterStats(stats: CharacterStats): Promise<void>
  addSession(session: SessionRecord): Promise<void>
  getRecentSessions(limit: number): Promise<SessionRecord[]>
  getUnlock(chapterId: string): Promise<UnlockState | undefined>
  getAllUnlocks(): Promise<UnlockState[]>
  upsertUnlock(unlock: UnlockState): Promise<void>
  exportSnapshot(): Promise<ProgressSnapshot>
  importSnapshot(snapshot: ProgressSnapshot): Promise<void>
  clearProgress(): Promise<void>
  clearAll(): Promise<void>
}
