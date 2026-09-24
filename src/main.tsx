import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'

import { App } from './app/App'
import { applyTheme, readTheme } from './lib/theme'
import './ui/styles.css'

// Antes de montar nada: si no, la app parpadea en el tema equivocado.
applyTheme(readTheme())

const container = document.getElementById('root')
if (!container) throw new Error('No se ha encontrado el elemento #root')

createRoot(container).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
