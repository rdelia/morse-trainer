# Morse Trainer

Local-first, multilingual Morse code training web app — from first tones to QSO copy and sending practice.

Live at [raffaeledelia.com/morse](https://raffaeledelia.com/morse/).

## Features

- **Learn** — a Koch-ordered lesson path in nine chapters: orientation, first sounds, building the
  alphabet, digits and punctuation, words, ham prosigns, callsigns, QSO copy, and endurance drills.
  Each lesson introduces its new characters by ear first, and you can step back and forth between
  them before the quiz starts.
- **Practice** — free drills outside the path: random 5-character groups, words, callsigns, QSO
  exchanges, head copy, and a warm-up that weights the characters you keep missing.
- **Send** — key with the spacebar, mouse or touch; your own timing is decoded back to text, with a
  button to reveal the target's pattern when you're stuck.
- **Wiki** — the history of the code plus distress signals, prosigns, Q-codes and the abbreviations
  you actually hear on the air, each section linked to its Wikipedia article.
- **Progress** — per-character accuracy, weak-character tracking, session history, and JSON
  export/import.
- **Reference** — the full alphabet, digits, punctuation and prosigns, tap any of them to hear it.
  Includes a mnemonic table that draws each letter's dots and dashes directly onto its shape, as
  a visual memory aid.
- Runs offline after the first load, and stores everything on the device.

## Languages

Six interface languages, each with its own word lists and a fully translated Wiki page:

| Tag | Language |
| --- | --- |
| `en` | English |
| `it` | Italian |
| `es` | Spanish |
| `fr` | French |
| `ca-valencia` | Valencian |
| `ro` | Romanian |

The language is detected from the browser on first run and can be changed in the header. Any `ca*`
browser tag maps to Valencian.

## Stack

- Vite + React + TypeScript
- Web Audio Morse engine (Farnsworth / Koch timing)
- i18next + browser language detection
- Zustand stores, IndexedDB persistence via `idb`
- PWA with a build-stamped service worker

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

`npm run build` typechecks first (`tsc && vite build`). Production is built for
`https://raffaeledelia.com/morse/` (`base: /morse/`); `npm run dev` still serves from `/`.

## Layout

```
src/
  components/   shared UI, drills, lesson intro, language switcher
  content/      per-language word lists
  curriculum/   chapters, lessons, Koch order, balanced sampling
  data/         types and the IndexedDB progress repository
  hooks/        the shared Morse player hook
  i18n/         i18next setup and locales/<tag>/*.json
  morse/        alphabet, timing, scheduler, Web Audio playback, keying decoder
  pages/        one component per route
  stores/       zustand settings and progress stores
  styles/       global CSS and design tokens
```

### Adding a language

1. Copy `src/i18n/locales/en/` to `src/i18n/locales/<tag>/` and translate the eight JSON files,
   keeping every key and `{{placeholder}}` intact.
2. Add a diacritic-free word list to `src/content/words/lists.ts` and map it in
   `src/content/words/index.ts` — Morse has no accented characters, so write `PAMANT`, not `PĂMÂNT`.
3. Add the tag to the `Locale` union in `src/data/types.ts`, to `SUPPORTED` in
   `src/stores/settingsStore.ts`, to `LOCALES` in `src/components/LanguageSwitcher.tsx`, and to the
   resources and `supportedLngs` in `src/i18n/index.ts`.
