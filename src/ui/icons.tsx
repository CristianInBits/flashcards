/**
 * Iconos de la navegación. En línea y dibujados a trazo, para que hereden el
 * color del texto y cambien solos con el tema; una librería de iconos pesaría
 * más que toda la barra.
 */
const COMMON = {
  className: 'shell__icon',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

/** Dos tarjetas superpuestas, como el icono de la aplicación. */
export function DecksIcon() {
  return (
    <svg {...COMMON}>
      <rect x="7" y="3" width="13" height="16" rx="3" />
      <path d="M16 21H7a3 3 0 0 1-3-3V7" />
    </svg>
  )
}

export function StatsIcon() {
  return (
    <svg {...COMMON}>
      <path d="M5 20V12" />
      <path d="M12 20V5" />
      <path d="M19 20v-5" />
    </svg>
  )
}

export function SettingsIcon() {
  return (
    <svg {...COMMON}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19.4 14a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.3a2 2 0 1 1-4 0v-.2a1.6 1.6 0 0 0-2.8-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H3a2 2 0 1 1 0-4h.2A1.6 1.6 0 0 0 4.3 6.3l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 2.7-1.1V2a2 2 0 1 1 4 0v.2a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.3a2 2 0 1 1 0 4h-.2a1.6 1.6 0 0 0-1.1 1z" />
    </svg>
  )
}
