/**
 * Tema claro / oscuro.
 *
 * La preferencia se guarda en localStorage y no en IndexedDB porque hay que
 * aplicarla **antes del primer pintado**: una lectura asíncrona haría que la
 * app parpadease en el tema equivocado cada vez que se abre.
 */
export type Theme = 'system' | 'light' | 'dark'

const KEY = 'carti:theme'
const THEMES: Theme[] = ['system', 'light', 'dark']

/** Los mismos que --bg en la hoja de estilos, para cada tema. */
const LIGHT_COLOR = '#f7f7fc'
const DARK_COLOR = '#161a24'

export function readTheme(): Theme {
  try {
    const stored = localStorage.getItem(KEY)
    return THEMES.includes(stored as Theme) ? (stored as Theme) : 'system'
  } catch {
    // Modo privado o almacenamiento bloqueado: se usa el del sistema.
    return 'system'
  }
}

export function saveTheme(theme: Theme): void {
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    // Sin poder guardarlo, el cambio vale solo para esta sesión.
  }
  applyTheme(theme)
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement
  if (theme === 'system') root.removeAttribute('data-theme')
  else root.setAttribute('data-theme', theme)

  updateStatusBarColor(theme)
}

/**
 * La barra de estado del móvil la pinta el navegador con `theme-color`, y el
 * index.html declara uno por esquema de color. Si el usuario fuerza un tema hay
 * que poner el mismo color en los dos, o la barra se queda con el del sistema
 * y desentona con la app.
 */
function updateStatusBarColor(theme: Theme): void {
  const metas = document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')

  for (const meta of metas) {
    const media = meta.getAttribute('media') ?? ''
    if (theme === 'system') {
      meta.content = media.includes('dark') ? DARK_COLOR : LIGHT_COLOR
    } else {
      meta.content = theme === 'dark' ? DARK_COLOR : LIGHT_COLOR
    }
  }
}
