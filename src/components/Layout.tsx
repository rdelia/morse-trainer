import { useEffect, useId, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from './LanguageSwitcher'
import './Layout.css'

const LINKS = [
  { to: '/', key: 'home', end: true },
  { to: '/learn', key: 'learn' },
  { to: '/practice', key: 'practice' },
  { to: '/send', key: 'send' },
  { to: '/progress', key: 'progress' },
  { to: '/reference', key: 'reference' },
  { to: '/wiki', key: 'wiki' },
  { to: '/settings', key: 'settings' },
] as const

export function Layout() {
  const { t } = useTranslation('common')
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuId = useId()
  const isHome = location.pathname === '/'

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  return (
    <div className="app-shell">
      <div className="app-atmosphere" aria-hidden />
      <header className={`app-header ${isHome ? 'app-header--home' : ''}`}>
        {!isHome ? (
          <NavLink to="/" className="brand-mark">
            {t('brand')}
          </NavLink>
        ) : null}

        <nav className="app-nav app-nav--desktop" aria-label="Main">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={'end' in l ? l.end : false}
              className={({ isActive }) => (isActive ? 'is-active' : undefined)}
            >
              {t(`nav.${l.key}`)}
            </NavLink>
          ))}
        </nav>

        <div className="header-lang">
          <LanguageSwitcher compact />
        </div>

        <button
          type="button"
          className={`menu-toggle ${menuOpen ? 'is-open' : ''}`}
          aria-expanded={menuOpen}
          aria-controls={menuId}
          aria-label={menuOpen ? t('menuClose') : t('menuOpen')}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className="menu-toggle__bar" />
          <span className="menu-toggle__bar" />
          <span className="menu-toggle__bar" />
        </button>
      </header>

      <div
        className={`nav-drawer-backdrop ${menuOpen ? 'is-open' : ''}`}
        aria-hidden={!menuOpen}
        onClick={() => setMenuOpen(false)}
      />

      <nav
        id={menuId}
        className={`nav-drawer ${menuOpen ? 'is-open' : ''}`}
        aria-label="Main"
        aria-hidden={!menuOpen}
        inert={!menuOpen ? true : undefined}
      >
        {LINKS.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={'end' in l ? l.end : false}
            className={({ isActive }) => (isActive ? 'is-active' : undefined)}
            onClick={() => setMenuOpen(false)}
          >
            {t(`nav.${l.key}`)}
          </NavLink>
        ))}
      </nav>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
