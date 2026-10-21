import { create } from 'zustand'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

/** iOS never fires beforeinstallprompt; installing there is a manual Share-sheet step. */
const IOS =
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

interface InstallState {
  /** The captured beforeinstallprompt event. Single-use. */
  deferred: BeforeInstallPromptEvent | null
  /** Running as an installed app, or installed during this session. */
  installed: boolean
  install: () => Promise<void>
}

export const useInstallStore = create<InstallState>((set, get) => ({
  deferred: null,
  installed: isStandalone(),
  install: async () => {
    const { deferred } = get()
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice
    // The event can only be prompted once, whatever the user chose.
    set({ deferred: null })
  },
}))

/**
 * Listen from startup, not from a component effect: the browser can fire
 * beforeinstallprompt before React has mounted (the app waits on IndexedDB
 * hydration first), and a missed event is never replayed.
 */
export function setupInstallPrompt(): void {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    useInstallStore.setState({ deferred: e as BeforeInstallPromptEvent })
  })
  window.addEventListener('appinstalled', () => {
    useInstallStore.setState({ deferred: null, installed: true })
  })
}

export function useInstallState(): { available: boolean; ios: boolean } {
  const deferred = useInstallStore((s) => s.deferred)
  const installed = useInstallStore((s) => s.installed)
  return { available: !installed && (deferred !== null || IOS), ios: IOS }
}
