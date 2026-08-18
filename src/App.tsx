import { useEffect, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { LearnPage } from './pages/LearnPage'
import { LessonPage } from './pages/LessonPage'
import { PracticePage } from './pages/PracticePage'
import { PracticeModePage } from './pages/PracticeModePage'
import { SendPage } from './pages/SendPage'
import { ProgressPage } from './pages/ProgressPage'
import { ReferencePage } from './pages/ReferencePage'
import { HistoryPage } from './pages/HistoryPage'
import { SettingsPage } from './pages/SettingsPage'
import { useSettingsStore } from './stores/settingsStore'
import { useProgressStore } from './stores/progressStore'
import { useTranslation } from 'react-i18next'

function Boot({ children }: { children: ReactNode }) {
  const { t } = useTranslation()
  const hydrateSettings = useSettingsStore((s) => s.hydrate)
  const hydrateProgress = useProgressStore((s) => s.hydrate)
  const settingsHydrated = useSettingsStore((s) => s.hydrated)
  const progressHydrated = useProgressStore((s) => s.hydrated)
  const ready = settingsHydrated && progressHydrated

  useEffect(() => {
    void hydrateSettings()
    void hydrateProgress()
  }, [hydrateSettings, hydrateProgress])

  if (!ready) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
        {t('loading')}
      </div>
    )
  }
  return children
}

export default function App() {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'
  return (
    <BrowserRouter basename={basename}>
      <Boot>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="learn" element={<LearnPage />} />
            <Route path="learn/:lessonId" element={<LessonPage />} />
            <Route path="practice" element={<PracticePage />} />
            <Route path="practice/:mode" element={<PracticeModePage />} />
            <Route path="send" element={<SendPage />} />
            <Route path="progress" element={<ProgressPage />} />
            <Route path="reference" element={<ReferencePage />} />
            <Route path="wiki" element={<HistoryPage />} />
            <Route path="history" element={<Navigate to="/wiki" replace />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Boot>
    </BrowserRouter>
  )
}
