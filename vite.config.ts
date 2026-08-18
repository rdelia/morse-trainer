import { execSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

/** Production is hosted at https://raffaeledelia.com/morse/ */
const base = process.env.NODE_ENV === 'production' ? '/morse/' : '/'

function resolveBuildId(): string {
  let git = 'unknown'
  try {
    git = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim()
  } catch {
    // no git available
  }
  return `${git}-${Date.now()}`
}

const buildId = resolveBuildId()

function appVersionPlugin(id: string): Plugin {
  let outDir = 'dist'
  return {
    name: 'app-version',
    config() {
      return {
        define: {
          'import.meta.env.VITE_APP_BUILD_ID': JSON.stringify(id),
        },
      }
    },
    configResolved(config) {
      outDir = config.build.outDir
    },
    closeBundle: {
      sequential: true,
      order: 'post',
      handler() {
        writeFileSync(resolve(outDir, 'version.json'), JSON.stringify({ id }), 'utf8')
      },
    },
  }
}

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.png', 'favicon-192.png', 'favicon-512.png'],
      manifest: {
        name: 'Morse Trainer',
        short_name: 'Morse Trainer',
        description: 'Learn Morse code from zero to hero',
        theme_color: '#1a1c1e',
        background_color: '#1a1c1e',
        display: 'standalone',
        start_url: base,
        scope: base,
        icons: [
          {
            src: 'favicon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'favicon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'favicon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,json,woff2}'],
        // og-image.jpg is only ever fetched by link scrapers, so keep its
        // weight out of every visitor's precache.
        globIgnores: ['**/node_modules/**/*', '**/version.json', '**/og-image.jpg'],
        navigateFallback: `${base}index.html`,
        skipWaiting: true,
        clientsClaim: true,
      },
    }),
    appVersionPlugin(buildId),
  ],
})
