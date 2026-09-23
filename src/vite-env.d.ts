/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/react" />

/** Versión de package.json, inyectada por Vite en tiempo de compilación. */
declare const __APP_VERSION__: string

/**
 * highlight.js solo declara tipos para su entrada principal, no para las
 * gramáticas sueltas de highlight.js/lib/languages/*.
 */
declare module 'highlight.js/lib/languages/*' {
  import type { LanguageFn } from 'highlight.js'
  const language: LanguageFn
  export default language
}
