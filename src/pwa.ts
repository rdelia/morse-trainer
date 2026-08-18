import { registerSW } from 'virtual:pwa-register'

const RELOAD_KEY = 'morse-pwa-reloaded-for'
let reloading = false

function reloadPage(): void {
  if (reloading) return
  reloading = true
  location.reload()
}

async function unregisterWorkersAndCaches(): Promise<void> {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations()
    await Promise.all(registrations.map((registration) => registration.unregister()))
  }
  if ('caches' in window) {
    const keys = await caches.keys()
    await Promise.all(keys.map((key) => caches.delete(key)))
  }
}

function reloadOnceFor(id: string): void {
  sessionStorage.setItem(RELOAD_KEY, id)
  location.reload()
}

async function checkDeployedVersion(): Promise<void> {
  const bakedId = import.meta.env.VITE_APP_BUILD_ID
  if (!bakedId) return

  try {
    const url = new URL('version.json', `${window.location.origin}${import.meta.env.BASE_URL}`)
    const response = await fetch(url, { cache: 'no-store' })
    if (!response.ok) return

    const data: unknown = await response.json()
    const networkId =
      typeof data === 'object' && data !== null && 'id' in data && typeof data.id === 'string'
        ? data.id
        : ''
    if (!networkId || networkId === bakedId) {
      sessionStorage.removeItem(RELOAD_KEY)
      return
    }

    if (sessionStorage.getItem(RELOAD_KEY) === networkId) return

    await unregisterWorkersAndCaches()
    reloadOnceFor(networkId)
  } catch {
    // Offline or version.json not present (local dev).
  }
}

export function setupPwa(): void {
  registerSW({ immediate: true, onNeedReload: reloadPage })

  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.addEventListener('controllerchange', reloadPage)
  }

  if (import.meta.env.PROD) {
    void checkDeployedVersion()
  }
}
