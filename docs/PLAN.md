# Flashcards — Plan y alcance

> Documento vivo. Recoge las decisiones tomadas, el alcance de la v1 y la hoja de ruta.
> Última revisión: 2026-09-23.

## 1. Visión

Una aplicación personal de tarjetas de pregunta-respuesta con repetición espaciada, que se
instala en el móvil, funciona sin conexión y guarda todo en el propio dispositivo.

Criterio de éxito de la v1: **poder estudiar de camino a clase, sin cobertura, sin haber
iniciado sesión en nada.**

## 2. Decisiones cerradas

| Ámbito | Decisión | Motivo |
|---|---|---|
| Distribución | PWA instalable | Un solo código para Android e iOS, sin cuentas de desarrollador ni revisiones de tienda |
| Datos | 100% locales (IndexedDB), uso personal | Sin backend, sin costes, sin login, offline real |
| Repaso | Leitner de 5 cajas | El grueso del beneficio del SRS con una fracción de la complejidad |
| Autoevaluación | 3 botones: Mal / Bien / Fácil | Matiz suficiente sin cargar la pantalla |
| Organización | Mazos planos + etiquetas | Flexible y sin navegación anidada en pantalla pequeña |
| Tipo de carta | Básica (anverso → reverso) | Es el núcleo; cloze e invertida quedan para después |
| Contenido | Markdown + LaTeX + código + imágenes | Cubre asignaturas de letras, ciencias y programación |
| Origen | Manual + importación Markdown/CSV + generación con IA | La importación es además el plan B de la IA |
| IA | Clave de API propia, guardada en el dispositivo | Sin backend; se paga por uso |
| Despliegue | GitHub Pages vía GitHub Actions | Gratis, HTTPS y en el mismo repositorio |
| Idioma | Español únicamente, sin capa de traducción | App personal; i18n sería complejidad sin uso |
| Sesión | Sin límite diario de cartas | Se repasa lo que toca; el algoritmo ya reparte la carga |

## 3. Alcance

### Dentro de la v1

- Crear, editar, borrar y duplicar mazos y cartas.
- Etiquetas libres con filtrado.
- Estudio con Leitner: cola de cartas vencidas, volteo, tres botones.
- Práctica libre: el mazo entero, sin tocar la programación ni las estadísticas.
- Gestos: deslizar para calificar, animación de giro 3D.
- Markdown, fórmulas LaTeX, bloques de código e imágenes en anverso y reverso.
- Importación desde Markdown y CSV (pegado o fichero).
- Exportación e importación de copia de seguridad completa (JSON).
- Estadísticas: cartas repasadas por día, racha, aciertos, distribución por cajas.
- Tema claro/oscuro siguiendo el sistema, con conmutador manual.
- Instalable y funcional sin conexión.
- Generación de cartas con IA a partir de un texto.

### Fuera de la v1 (posibles v2)

- Sincronización en la nube y cuentas de usuario.
- Cartas cloze, invertidas y de opción múltiple.
- Importación de mazos `.apkg` de Anki.
- Notificaciones de recordatorio diario.
- Audio y lectura en voz alta (TTS).
- Compartir mazos entre usuarios.
- Empaquetado nativo con Capacitor.

## 4. Modelo de datos

Almacenamiento: **IndexedDB** mediante [Dexie](https://dexie.org/) — menos código que la API
cruda y con migraciones versionadas.

```ts
type Grade = 'again' | 'good' | 'easy';

interface Deck {
  id: string;            // uuid
  name: string;
  description?: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

interface Card {
  id: string;
  deckId: string;
  front: string;         // markdown
  back: string;          // markdown
  mediaIds: string[];    // imágenes referenciadas
  box: 1 | 2 | 3 | 4 | 5;
  dueDate: string;       // 'YYYY-MM-DD' en hora local
  reps: number;          // repasos totales
  lapses: number;        // veces que ha caído a la caja 1
  lastReviewedAt?: number;
  suspended: boolean;
  createdAt: number;
  updatedAt: number;
}

interface ReviewLog {    // alimenta las estadísticas; nunca se edita
  id: string;
  cardId: string;
  deckId: string;
  reviewedAt: number;
  grade: Grade;
  boxBefore: number;
  boxAfter: number;
}

interface MediaItem {
  id: string;
  blob: Blob;
  mime: string;
  createdAt: number;
}

interface Settings {
  apiKey?: string;       // solo en este dispositivo
  lastBackupAt?: number;
}
```

El **tema** no vive aquí sino en `localStorage`, porque hay que aplicarlo antes del primer
pintado: una lectura asíncrona de IndexedDB haría que la aplicación parpadease en el tema
equivocado cada vez que se abre.

Índices: `cards` por `deckId`, por `dueDate` y compuesto `[deckId+dueDate]` — es la consulta
caliente, "cartas vencidas de este mazo". `reviewLogs` por `reviewedAt`.

## 5. El motor Leitner, especificado

Cinco cajas con intervalos fijos en días:

| Caja | 1 | 2 | 3 | 4 | 5 |
|---|---|---|---|---|---|
| Intervalo | 1 día | 2 días | 4 días | 8 días | 16 días |

Reglas:

- Una carta nueva nace en la **caja 1** con `dueDate` = hoy.
- **Mal** → vuelve a la caja 1, `dueDate` = mañana, y se reencola al final de la sesión actual
  para volver a verla hoy. Suma una recaída (`lapses`) **solo si venía de una caja superior**:
  fallar una carta que ya estaba en la caja 1 es aprenderla, no recaer.
- **Bien** → sube una caja (tope 5), `dueDate` = hoy + intervalo de la nueva caja.
- **Fácil** → sube dos cajas (tope 5), `dueDate` = hoy + intervalo de la nueva caja.
- Una carta está **vencida** si `dueDate <= hoy`, comparando fechas locales a medianoche, no
  marcas de tiempo: si estudias a las 23:50 y luego a las 00:10, son dos días distintos.
- Una carta en la caja 5 acertada se queda en la 5 y vuelve en 16 días. No hay estado
  "aprendida" definitivo: todo se repasa para siempre, solo que más espaciado.

Sesión de estudio: todas las cartas vencidas del mazo (o de la selección de etiquetas),
barajadas, **sin tope de cartas**. Las falladas se reinyectan al final, así que la sesión
termina cuando de verdad no queda nada vencido. Es el propio algoritmo el que reparte la carga:
si un día toca mucho, es porque ese día toca mucho.

Esta lógica vive en `src/domain/leitner.ts` como **funciones puras**
(`gradeCard(card, grade, now) → { card, log }`), y la cola de la sesión en `src/domain/session.ts`
(`startSession`, `answer`), inmutable: cada respuesta devuelve una sesión nueva. Ambos están
cubiertos por tests, así que migrar a FSRS en el futuro es sustituir un módulo, no reescribir
la aplicación.

### Práctica libre

Además del repaso programado hay un modo de **práctica libre**: entra el mazo entero, vencido o
no, y **no se escribe absolutamente nada** — ni cajas, ni fechas, ni registro de repaso. Sirve
para machacar antes de un examen sin descolocar la programación ni ensuciar las estadísticas.

Reutiliza la misma cola de `session.ts` y se salta `gradeCard` y `saveReview`, que son los dos
únicos sitios donde se escribe. No hay una segunda implementación del repaso que mantener.

Solo tiene dos respuestas, Fallada y Acertada, porque son las dos únicas que hacen algo distinto:
la fallada vuelve al final de la cola y la acertada se retira. Mantener los tres botones del
repaso sería enseñar dos que hacen exactamente lo mismo.

## 6. Arquitectura

```
src/
  app/           # entrada, rutas, layout, proveedores de contexto
  domain/        # lógica pura sin React: leitner.ts, sesión, tipos, validación
  data/          # db.ts (Dexie), repositorios, importadores, export/backup
  features/
    decks/       # lista y detalle de mazos
    study/       # pantalla de estudio, carta, gestos
    editor/      # editor de cartas con vista previa
    stats/       # estadísticas y racha
    settings/    # ajustes, copia de seguridad, clave de API
    ai/          # generación de cartas
  ui/            # componentes compartidos y tokens de tema
  lib/           # markdown, katex, utilidades de fecha
```

La regla que importa: **`domain/` y `data/` no importan nada de React.** Son la parte que
sobrevive si algún día se envuelve con Capacitor o se rehace la interfaz.

**Convención de idioma**: los identificadores del código van en inglés (`Deck`, `Card`, `dueDate`),
los textos que ve el usuario y los comentarios en español. Las rutas también en español (`/ajustes`),
porque son visibles en la barra de direcciones.

### Lenguaje visual

Pastel y de bajo contraste entre superficies: fondos muy claros, tarjetas en blanco roto, bordes
finos y sombras mínimas. **La tarjeta destaca por espacio, tamaño y tipografía, no por colores
fuertes**; el violeta de marca se reserva para acentos, estado activo e indicadores, y nunca se usa
en superficies grandes. El rosa, el verde y el azul quedan para estados.

Todo son tokens CSS en `src/ui/styles.css`: el tema claro los define en `:root` y el oscuro solo
los redefine.

El **tema oscuro** no es el claro invertido ni un gris teñido. Se probaron primero tres paletas de
editor de código (Catppuccin, Rosé Pine, Tokyo Night) y las tres se veían igual de apagadas; la
medición explicó por qué: **la tarjeta de estudio, que ocupa media pantalla, estaba entre S19 y S24
de saturación en todas**. El acento son cuatro píxeles y la tarjeta es la pantalla. Material 3 lo
documenta: las superficies oscuras se derivan de una paleta neutra de croma bajo, y hay que
derivarlas del color de marca para que dejen de ser grises.

El oscuro actual es un índigo con las superficies a S54, más del doble, y un degradado de tres
manchas difuminadas sobre el fondo. **Las opacidades de las manchas están calculadas, no elegidas
a ojo**: donde las tres se solapan aclaran el fondo, y el texto apagado encima tiene que seguir
pasando el 4.5:1. A 18/16/13% el peor solape da 4.76; con las opacidades que quedaban bien a
primera vista (55/32/22) bajaba a 2.08.

El degradado vive en una capa fija propia (`.shell__mesh`) y no en el `body` con
`background-attachment: fixed`, que en iOS Safari repinta en cada scroll. La cabecera es
translúcida con desenfoque, porque opaca taparía el degradado con una banda plana.

**Cada pareja de texto y fondo llega al 4.5:1 de la WCAG AA.** Se midieron una a una y varias hubo
que oscurecerlas: una paleta pastel se queda corta de contraste con muchísima facilidad, y la app
se usa a menudo en la calle.

### Dependencias previstas

| Necesidad | Elección | Nota |
|---|---|---|
| Base | React 19 + TypeScript + Vite | |
| Rutas | React Router | |
| Persistencia | Dexie | IndexedDB con migraciones |
| PWA | `vite-plugin-pwa` (Workbox) | Manifest, service worker y actualización |
| Markdown | `react-markdown` + `remark-gfm` | |
| Fórmulas | `remark-math` + `rehype-katex` + KaTeX | Carga diferida |
| Código | `lowlight` con nueve lenguajes, en un plugin propio | Carga diferida. `rehype-highlight` se descartó: importa estáticamente las ~38 gramáticas «common» de highlight.js y su opción `languages` no lo evita |
| Tests | Vitest | Obligatorios en `domain/` |

Volteo y gestos con transformaciones CSS 3D y eventos de puntero propios, sin librería de
animación, para no pagar bundle. Si se queda corto, `motion` es la alternativa.

## 7. Pantallas

1. **Mis mazos** — lista con contador de cartas vencidas por mazo, filtro por etiquetas, botón
   de estudiar todo y de crear mazo.
2. **Mazo** — cartas del mazo, buscador y acciones: estudiar, añadir, importar, generar con IA.
3. **Estudio** — la pantalla que más se usa: anverso, gesto o toque para voltear, reverso y tres
   botones. Barra de progreso de la sesión y contador de restantes.
4. **Editor de carta** — anverso y reverso en Markdown con vista previa en vivo y adjuntar imagen.
5. **Importar** — pegar texto o subir fichero, elegir formato, previsualizar las cartas
   detectadas y confirmar.
6. **Generar con IA** — pegar un tema o unos apuntes, número de cartas, previsualizar y confirmar.
7. **Estadísticas** — racha, cartas por día, aciertos y distribución por cajas.
8. **Ajustes** — tema, clave de API, copia de seguridad, borrar todo.

## 8. Formatos de importación

Tres formatos soportados, detectados automáticamente y forzables a mano:

1. **Una línea por carta** — `pregunta :: respuesta`. Es el formato de los plugins de repetición
   espaciada de Obsidian, cómodo para apuntes que ya existen.
2. **Por encabezados** — cada `##` es la pregunta y el contenido hasta el siguiente encabezado es
   la respuesta. Bueno para respuestas largas con formato.
3. **CSV/TSV** — primera columna la pregunta, segunda la respuesta, con cabecera opcional. El
   delimitador se detecta entre coma, **punto y coma** (lo que exporta Excel en español) y
   tabulador, y las comillas se respetan, así que una respuesta con comas no rompe la
   importación. Las columnas de más se ignoran: no hay etiquetas por carta, las etiquetas son
   del mazo.

La previsualización antes de confirmar es parte del alcance: importar a ciegas 200 cartas mal
cortadas es el error más caro de deshacer.

## 8 bis. Imágenes y copia de seguridad

Las imágenes no caben en el Markdown: se guardan como blobs en IndexedDB y en el texto queda
una referencia `![descripción](carti:<id>)`. Se usa un esquema propio en vez de una URL de
objeto porque las URL de objeto mueren al recargar y el texto de la carta se guarda para
siempre. Antes de guardarla, una imagen de más de 1600 px o de medio mega se reescala y se
recodifica a WebP con calidad 0,9 — alta a propósito, porque aquí hay esquemas con texto y el
texto es lo primero que se emborrona al comprimir.

Los blobs que ya no cita ninguna carta se borran al editar o borrar una carta. Se recorren
todas las cartas en vez de llevar un contador de referencias: cuesta milisegundos y un contador
mal llevado deja basura invisible o borra una imagen que sí se usaba.

La copia de seguridad es un JSON con todo dentro, las imágenes incluidas como data URL.
Restaurar **reemplaza** lo que haya en el dispositivo, no fusiona: mezclar dos bases con los
mismos identificadores acaba en cartas duplicadas o pisadas, y una copia es para volver a un
estado conocido. En el móvil se ofrece por el menú de compartir del sistema, porque en iOS una
descarga directa desde una app instalada no lleva a ninguna parte.

## 9. Generación con IA

- Modelo: `claude-opus-5`.
- Salida estructurada (`output_config.format`) con un esquema `{ cards: [{ front, back, tags }] }`,
  para no tener que analizar texto libre.
- La clave se guarda en los ajustes, **solo en este dispositivo**, y no se envía a ningún sitio que
  no sea la API de Anthropic.
- Llamada desde el navegador con el SDK oficial `@anthropic-ai/sdk` y `dangerouslyAllowBrowser: true`.
  **A verificar en la fase 5**: llamar a la API directamente desde el navegador exige que la petición
  vaya marcada como acceso directo desde navegador. Si el CORS lo impide, hay dos planes B ya
  previstos — generar el contenido fuera y traerlo por el importador (coste cero) o un Worker de
  Cloudflare de veinte líneas como proxy.
- Coste orientativo: entrada 5 $/millón de tokens, salida 25 $/millón. Generar un mazo de unas 30
  cartas a partir de un tema son céntimos.

## 10. Hoja de ruta

| Fase | Contenido | Entregable |
|---|---|---|
| 0 ✅ | Andamiaje: Vite + React + TS, estructura de carpetas, PWA mínima, Action de despliegue | App instalable en el móvil desde GitHub Pages |
| 1 ✅ | Modelo de datos, Dexie, CRUD de mazos y cartas, editor con Markdown/LaTeX/código | Se pueden crear y organizar cartas |
| 2 ✅ | Motor Leitner con tests, pantalla de estudio, volteo y gestos | **La app ya sirve para estudiar** |
| 3 ✅ | Importadores Markdown/CSV, imágenes, copia de seguridad JSON | Se pueden volcar los apuntes que ya tienes |
| 4 ✅ | Estadísticas, racha, tema claro/oscuro, ajustes | Versión 1.0 |
| 5 | Generación con IA | |

La fase 2 es la frontera real: a partir de ahí la aplicación es usable a diario y todo lo demás es
mejora incremental.

## 11. Riesgos conocidos

- **iOS.** Instalar una PWA solo se puede desde Safari (Compartir → Añadir a pantalla de inicio).
  Además, iOS puede purgar el almacenamiento de webs que no se abren en semanas. Mitigación: pedir
  `navigator.storage.persist()` al instalar y recordar la copia de seguridad si hace mucho de la última.
- **Sin sincronización, el dispositivo es el único sitio donde están los datos.** La copia de
  seguridad manual de la fase 3 no es un extra, es la red de seguridad.
- **Tamaño del bundle.** KaTeX y el resaltado de código pesan. Se cargan con `import()` dinámico solo
  cuando una carta los necesita.
- **Ruta base.** GitHub Pages sirve el proyecto en `/flashcards/`; hay que configurar `base` en Vite y
  `start_url`/`scope` en el manifest o el service worker no se registrará bien.
- **Imágenes y copia de seguridad.** Con imágenes, el JSON deja de ser ligero. Opción prevista:
  exportar en `.zip` o avisar del tamaño antes de generar el fichero.

## 12. Decisiones pendientes

- Nombre definitivo de la aplicación. El icono se genera con el prompt de [ICONO.md](ICONO.md).

Los textos de la interfaz se escriben directamente en español en el código, sin fichero de
traducciones ni librería de i18n. Si algún día hiciera falta otro idioma, extraerlos es un
trabajo mecánico; montar la infraestructura ahora sería complejidad sin uso.
