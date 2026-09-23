import { Link, Outlet, useLocation } from 'react-router'

import { UpdatePrompt } from './UpdatePrompt'

const NAV = [
  { to: '/', label: 'Mazos', section: 'mazos' },
  { to: '/ajustes', label: 'Ajustes', section: 'ajustes' },
]

export function AppShell() {
  const { pathname } = useLocation()
  // Las pantallas de mazo y de carta cuelgan de «Mazos», así que la pestaña
  // sigue marcada mientras se navega dentro de esa sección.
  const current = pathname.startsWith('/ajustes') ? 'ajustes' : 'mazos'

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
          <Link
            key={item.to}
            to={item.to}
            className={current === item.section ? 'shell__link is-active' : 'shell__link'}
            aria-current={current === item.section ? 'page' : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <UpdatePrompt />
    </div>
  )
}
