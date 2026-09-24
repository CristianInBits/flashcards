import type { JSX } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Link, Outlet, useLocation } from 'react-router'

import { loadStreak } from '../data/stats'
import { DecksIcon, SettingsIcon, StatsIcon } from './icons'
import { UpdatePrompt } from './UpdatePrompt'

const NAV: { to: string; label: string; section: string; icon: () => JSX.Element }[] = [
  { to: '/', label: 'Mazos', section: 'mazos', icon: DecksIcon },
  { to: '/estadisticas', label: 'Progreso', section: 'estadisticas', icon: StatsIcon },
  { to: '/ajustes', label: 'Ajustes', section: 'ajustes', icon: SettingsIcon },
]

export function AppShell() {
  const { pathname } = useLocation()
  // Las pantallas de mazo y de carta cuelgan de «Mazos», así que la pestaña
  // sigue marcada mientras se navega dentro de esa sección.
  const current = pathname.startsWith('/ajustes')
    ? 'ajustes'
    : pathname.startsWith('/estadisticas')
      ? 'estadisticas'
      : 'mazos'

  const streak = useLiveQuery(() => loadStreak(), [])

  return (
    <div className="shell">
      <header className="shell__header">
        <span className="shell__title">
          Cart<i>i</i>
        </span>

        {streak && streak.current > 0 && (
          <Link className="streak" to="/estadisticas">
            <span className="streak__flame" aria-hidden>
              🔥
            </span>
            {streak.current} {streak.current === 1 ? 'día' : 'días'}
          </Link>
        )}
      </header>

      <main className="shell__main">
        <Outlet />
      </main>

      <nav className="shell__nav" aria-label="Secciones">
        {NAV.map((item) => {
          const active = current === item.section
          const Icon = item.icon
          return (
            <Link
              key={item.to}
              to={item.to}
              className={active ? 'shell__link is-active' : 'shell__link'}
              aria-current={active ? 'page' : undefined}
            >
              <Icon />
              {item.label}
              {active && <span className="shell__dot" aria-hidden />}
            </Link>
          )
        })}
      </nav>

      <UpdatePrompt />
    </div>
  )
}
