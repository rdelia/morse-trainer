import { create } from 'zustand'
import { progressRepo } from '../data/idbProgressRepository'
import {
  DEFAULT_SETTINGS,
  type AppSettings,
  type Locale,
} from '../data/types'
import i18n from '../i18n'

const SUPPORTED: Locale[] = ['en', 'it', 'es', 'fr', 'ro', 'ca-valencia']

function detectLocale(): Locale {
  const preferred = navigator.languages?.length
    ? navigator.languages
    : [navigator.language, i18n.resolvedLanguage, i18n.language]
  for (const raw of preferred) {
    const tag = (raw ?? '').toLowerCase()
    // Catalan browsers get Valencian, the only variety shipped.
    if (tag.startsWith('ca')) return 'ca-valencia'
    const base = tag.slice(0, 2)
    if (SUPPORTED.includes(base as Locale)) return base as Locale
  }
  return 'en'
}

interface SettingsState {
  settings: AppSettings
  hydrated: boolean
  hydrate: () => Promise<void>
  setSettings: (partial: Partial<AppSettings>) => Promise<void>
  setLocale: (locale: Locale) => Promise<void>
}

let hydrateInFlight: Promise<void> | null = null

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: { ...DEFAULT_SETTINGS },
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return
    if (hydrateInFlight) return hydrateInFlight
    hydrateInFlight = (async () => {
      const fromDb = await progressRepo.getSettings()
      const lessons = await progressRepo.getAllLessonProgress()
      // First visit (no saved progress): adopt browser language
      let settings = fromDb
      if (lessons.length === 0) {
        const detected = detectLocale()
        if (detected !== fromDb.locale && fromDb.locale === DEFAULT_SETTINGS.locale) {
          settings = { ...fromDb, locale: detected }
          await progressRepo.saveSettings(settings)
        }
      }
      await i18n.changeLanguage(settings.locale)
      document.documentElement.lang = settings.locale
      set({ settings, hydrated: true })
    })().finally(() => {
      hydrateInFlight = null
    })
    return hydrateInFlight
  },

  setSettings: async (partial) => {
    const next = { ...get().settings, ...partial }
    await progressRepo.saveSettings(next)
    set({ settings: next })
  },

  setLocale: async (locale) => {
    await i18n.changeLanguage(locale)
    document.documentElement.lang = locale
    await get().setSettings({ locale })
  },
}))
