import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { ProgressRepository } from './progressRepository'
import {
  DEFAULT_SETTINGS,
  newId,
  nowIso,
  type AppSettings,
  type CharacterStats,
  type LessonProgress,
  type Profile,
  type ProgressSnapshot,
  type SessionRecord,
  type UnlockState,
} from './types'

interface MorseDB extends DBSchema {
  meta: {
    key: string
    value: Profile | AppSettings
  }
  lessons: {
    key: string
    value: LessonProgress
    indexes: { 'by-lesson': string }
  }
  characters: {
    key: string
    value: CharacterStats
    indexes: { 'by-char': string }
  }
  sessions: {
    key: string
    value: SessionRecord
    indexes: { 'by-started': string }
  }
  unlocks: {
    key: string
    value: UnlockState
    indexes: { 'by-chapter': string }
  }
}

const DB_NAME = 'morse-trainer'
const DB_VERSION = 1

async function getDb(): Promise<IDBPDatabase<MorseDB>> {
  return openDB<MorseDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('meta')) {
        db.createObjectStore('meta')
      }
      if (!db.objectStoreNames.contains('lessons')) {
        const s = db.createObjectStore('lessons', { keyPath: 'id' })
        s.createIndex('by-lesson', 'lessonId', { unique: true })
      }
      if (!db.objectStoreNames.contains('characters')) {
        const s = db.createObjectStore('characters', { keyPath: 'id' })
        s.createIndex('by-char', 'char', { unique: true })
      }
      if (!db.objectStoreNames.contains('sessions')) {
        const s = db.createObjectStore('sessions', { keyPath: 'id' })
        s.createIndex('by-started', 'startedAt')
      }
      if (!db.objectStoreNames.contains('unlocks')) {
        const s = db.createObjectStore('unlocks', { keyPath: 'id' })
        s.createIndex('by-chapter', 'chapterId', { unique: true })
      }
    },
  })
}

export class IdbProgressRepository implements ProgressRepository {
  private async ensureProfile(db: IDBPDatabase<MorseDB>): Promise<Profile> {
    const existing = (await db.get('meta', 'profile')) as Profile | undefined
    if (existing) return existing
    const profile: Profile = {
      id: newId(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    }
    await db.put('meta', profile, 'profile')
    return profile
  }

  async getProfile(): Promise<Profile> {
    const db = await getDb()
    return this.ensureProfile(db)
  }

  async getSettings(): Promise<AppSettings> {
    const db = await getDb()
    await this.ensureProfile(db)
    const s = (await db.get('meta', 'settings')) as AppSettings | undefined
    return { ...DEFAULT_SETTINGS, ...(s ?? {}) }
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    const db = await getDb()
    await db.put('meta', settings, 'settings')
  }

  async getLessonProgress(lessonId: string): Promise<LessonProgress | undefined> {
    const db = await getDb()
    return db.getFromIndex('lessons', 'by-lesson', lessonId)
  }

  async getAllLessonProgress(): Promise<LessonProgress[]> {
    const db = await getDb()
    return db.getAll('lessons')
  }

  async upsertLessonProgress(progress: LessonProgress): Promise<void> {
    const db = await getDb()
    const existing = await db.getFromIndex('lessons', 'by-lesson', progress.lessonId)
    if (existing) {
      await db.put('lessons', { ...progress, id: existing.id })
    } else {
      await db.put('lessons', progress)
    }
  }

  async getCharacterStats(char: string): Promise<CharacterStats | undefined> {
    const db = await getDb()
    return db.getFromIndex('characters', 'by-char', char)
  }

  async getAllCharacterStats(): Promise<CharacterStats[]> {
    const db = await getDb()
    return db.getAll('characters')
  }

  async upsertCharacterStats(stats: CharacterStats): Promise<void> {
    const db = await getDb()
    const existing = await db.getFromIndex('characters', 'by-char', stats.char)
    if (existing) {
      await db.put('characters', { ...stats, id: existing.id })
    } else {
      await db.put('characters', stats)
    }
  }

  async addSession(session: SessionRecord): Promise<void> {
    const db = await getDb()
    await db.put('sessions', session)
  }

  async getRecentSessions(limit: number): Promise<SessionRecord[]> {
    const db = await getDb()
    const all = await db.getAllFromIndex('sessions', 'by-started')
    return all.reverse().slice(0, limit)
  }

  async getUnlock(chapterId: string): Promise<UnlockState | undefined> {
    const db = await getDb()
    return db.getFromIndex('unlocks', 'by-chapter', chapterId)
  }

  async getAllUnlocks(): Promise<UnlockState[]> {
    const db = await getDb()
    return db.getAll('unlocks')
  }

  async upsertUnlock(unlock: UnlockState): Promise<void> {
    const db = await getDb()
    const tx = db.transaction('unlocks', 'readwrite')
    const store = tx.objectStore('unlocks')
    const existing = await store.index('by-chapter').get(unlock.chapterId)
    await store.put({ ...unlock, id: existing?.id ?? unlock.id })
    await tx.done
  }

  async exportSnapshot(): Promise<ProgressSnapshot> {
    const db = await getDb()
    const profile = await this.ensureProfile(db)
    return {
      profile,
      settings: await this.getSettings(),
      lessons: await this.getAllLessonProgress(),
      characters: await this.getAllCharacterStats(),
      sessions: await db.getAll('sessions'),
      unlocks: await this.getAllUnlocks(),
      exportedAt: nowIso(),
      version: 1,
    }
  }

  async importSnapshot(snapshot: ProgressSnapshot): Promise<void> {
    const db = await getDb()
    const tx = db.transaction(
      ['meta', 'lessons', 'characters', 'sessions', 'unlocks'],
      'readwrite',
    )
    await tx.objectStore('meta').put(snapshot.profile, 'profile')
    await tx.objectStore('meta').put(snapshot.settings, 'settings')
    await tx.objectStore('lessons').clear()
    await tx.objectStore('characters').clear()
    await tx.objectStore('sessions').clear()
    await tx.objectStore('unlocks').clear()
    for (const l of snapshot.lessons) await tx.objectStore('lessons').put(l)
    for (const c of snapshot.characters) await tx.objectStore('characters').put(c)
    for (const s of snapshot.sessions) await tx.objectStore('sessions').put(s)
    for (const u of snapshot.unlocks) await tx.objectStore('unlocks').put(u)
    await tx.done
  }

  async clearProgress(): Promise<void> {
    const db = await getDb()
    const tx = db.transaction(
      ['lessons', 'characters', 'sessions', 'unlocks'],
      'readwrite',
    )
    await tx.objectStore('lessons').clear()
    await tx.objectStore('characters').clear()
    await tx.objectStore('sessions').clear()
    await tx.objectStore('unlocks').clear()
    await tx.done
  }

  async clearAll(): Promise<void> {
    const db = await getDb()
    const tx = db.transaction(
      ['meta', 'lessons', 'characters', 'sessions', 'unlocks'],
      'readwrite',
    )
    await tx.objectStore('meta').clear()
    await tx.objectStore('lessons').clear()
    await tx.objectStore('characters').clear()
    await tx.objectStore('sessions').clear()
    await tx.objectStore('unlocks').clear()
    await tx.done
  }
}

export const progressRepo = new IdbProgressRepository()
