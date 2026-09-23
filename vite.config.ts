import { readFileSync } from 'node:fs'

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages sirve el proyecto en https://<usuario>.github.io/flashcards/
// Si algún día se publica en un dominio propio, esto pasa a ser '/'.
const BASE = '/flashcards/'

const { version } = JSON.parse(readFileSync('./package.json', 'utf8')) as { version: string }

export default defineConfig({
  base: BASE,
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png', 'icons/favicon-32.png'],
      manifest: {
        name: 'Carti',
        short_name: 'Carti',
        description: 'Tarjetas de estudio con repetición espaciada',
        lang: 'es',
        dir: 'ltr',
        id: BASE,
        start_url: BASE,
        scope: BASE,
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#061c53',
        theme_color: '#061c53',
        categories: ['education', 'productivity'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Todo el contenido es estático: se precachea entero y la app abre sin red.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        cleanupOutdatedCaches: true,
        navigateFallback: `${BASE}index.html`,
      },
    }),
  ],
  test: {
    include: ['src/**/*.test.ts'],
  },
})
