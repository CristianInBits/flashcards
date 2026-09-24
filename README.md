# Carti

Tarjetas de estudio con repetición espaciada. Aplicación web instalable en el móvil, que
funciona sin conexión y guarda todo en el propio dispositivo: sin cuentas, sin servidor y sin
que los datos salgan de ahí.

**Versión 1.0 funcional.** Crear mazos y cartas con Markdown, fórmulas LaTeX, código e imágenes;
estudiarlas con repetición espaciada; importar apuntes desde Markdown o CSV; ver el progreso y la
racha; y guardar y restaurar una copia de seguridad. Queda la generación con IA (fase 5).

- [Plan y alcance](docs/PLAN.md) — decisiones, modelo de datos, algoritmo y hoja de ruta.
- [Icono](docs/ICONO.md) — prompt de generación y requisitos de los distintos tamaños.

## Desarrollo

```bash
npm install
npm run dev
```

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo en http://localhost:5173/flashcards/ |
| `npm run build` | Compila TypeScript y genera `dist/` con el service worker |
| `npm run preview` | Sirve `dist/` para probar la PWA real (el service worker no se registra en `dev`) |
| `npm test` | Tests con Vitest |
| `npm run lint` | ESLint |
| `npm run icons` | Regenera los iconos desde `assets/icon-source.png` |

## Estructura

```
src/
  app/        entrada y rutas
  domain/     lógica pura: Leitner y sesión de estudio   (fase 2)
  data/       Dexie, repositorios, importadores           (fase 1)
  features/   una carpeta por pantalla
  ui/         componentes compartidos y tokens de tema
  lib/        utilidades (fechas, markdown)
```

`domain/` y `data/` no importan React: son la parte que sobrevive a un cambio de interfaz.

## Despliegue

Cada push a `main` dispara [el workflow](.github/workflows/deploy.yml), que pasa lint, tests y
build y publica en GitHub Pages. Requiere tener activado **Settings → Pages → Source: GitHub
Actions** en el repositorio.

La ruta base (`/flashcards/`) está fijada en [vite.config.ts](vite.config.ts); si algún día se
publica en un dominio propio, se cambia ahí.

## Instalar en el móvil

- **Android (Chrome):** abrir la web y aceptar el aviso de instalación, o menú → *Instalar aplicación*.
- **iOS (Safari, obligatoriamente):** Compartir → *Añadir a pantalla de inicio*.
