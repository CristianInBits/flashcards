import { NavLink, Outlet } from 'react-router'

import { UpdatePrompt } from './UpdatePrompt'

const NAV = [
  { to: '/', label: 'Mazos', end: true },
  { to: '/ajustes', label: 'Ajustes', end: false },
]

export function AppShell() {
  return (
    <div className="shell">
      <header className="shell__header">
        <span className="shell__title">Carti</span>
      </header>

      <main className="shell__main">
        <Outlet />
      </main>

      <nav className="shell__nav" aria-label="Secciones">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => (isActive ? 'shell__link is-active' : 'shell__link')}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <UpdatePrompt />
    </div>
  )
}
