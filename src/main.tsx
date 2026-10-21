import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n'
import './styles/global.css'
import App from './App'
import { setupPwa } from './pwa'
import { setupInstallPrompt } from './installPrompt'

setupPwa()
setupInstallPrompt()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
