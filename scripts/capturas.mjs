/**
 * Regenera las capturas del README.
 *
 * Abre la aplicación en un navegador sin ventana, le siembra unos datos de
 * muestra en IndexedDB —mazos, cartas y un mes de repasos— y guarda tres
 * pantallas en `docs/capturas/`. Así las imágenes del README son de la
 * aplicación de verdad y no una maqueta, y se pueden rehacer en un comando
 * cuando cambie la interfaz.
 *
 *     npm run dev        # en otra terminal
 *     npm run capturas
 *
 * Se habla con el navegador por su protocolo de depuración, que es lo que ya
 * trae puesto: ni Puppeteer ni Playwright, que se descargan un Chromium entero
 * para esto.
 */
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const APP = 'http://localhost:5173/flashcards/'
const SALIDA = 'docs/capturas'
const PUERTO = 9333

/** Móvil de tamaño corriente, al doble de densidad para que no se vea borroso. */
const PANTALLA = { width: 390, height: 844, deviceScaleFactor: 2, mobile: true }

const NAVEGADORES = [
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
]

const espera = (ms) => new Promise((r) => setTimeout(r, ms))

function rendirse(motivo) {
  console.error(`\n${motivo}\n`)
  process.exit(1)
}

const navegador = NAVEGADORES.find((ruta) => existsSync(ruta))
if (!navegador) rendirse('No encuentro Edge ni Chrome. Añade su ruta a NAVEGADORES.')

try {
  await fetch(APP)
} catch {
  rendirse(`No responde ${APP}. Arranca el servidor con «npm run dev» y vuelve a intentarlo.`)
}

const perfil = join(tmpdir(), 'carti-capturas')
const proceso = spawn(
  navegador,
  [
    '--headless=new',
    `--remote-debugging-port=${PUERTO}`,
    `--user-data-dir=${perfil}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    '--hide-scrollbars',
    'about:blank',
  ],
  { stdio: 'ignore' },
)

let objetivo = null
for (let i = 0; i < 60 && !objetivo; i++) {
  try {
    const abiertas = await (await fetch(`http://127.0.0.1:${PUERTO}/json/list`)).json()
    objetivo = abiertas.find((t) => t.type === 'page')
  } catch {
    await espera(300)
  }
}
if (!objetivo) {
  proceso.kill()
  rendirse('El navegador no ha abierto su puerto de depuración.')
}

const sock = new WebSocket(objetivo.webSocketDebuggerUrl)
await new Promise((res, rej) => {
  sock.onopen = res
  sock.onerror = rej
})

let siguiente = 0
const pendientes = new Map()
sock.onmessage = (evento) => {
  const mensaje = JSON.parse(evento.data)
  if (mensaje.id && pendientes.has(mensaje.id)) {
    pendientes.get(mensaje.id)(mensaje)
    pendientes.delete(mensaje.id)
  }
}

function cdp(metodo, params = {}) {
  const id = ++siguiente
  return new Promise((res) => {
    pendientes.set(id, res)
    sock.send(JSON.stringify({ id, method: metodo, params }))
  })
}

async function evalua(expresion) {
  const respuesta = await cdp('Runtime.evaluate', {
    expression: expresion,
    awaitPromise: true,
    returnByValue: true,
  })
  const fallo = respuesta.result?.exceptionDetails
  if (fallo) throw new Error(fallo.exception?.description ?? JSON.stringify(fallo))
  return respuesta.result?.result?.value
}

async function navega(url) {
  await cdp('Page.navigate', { url })
  for (let i = 0; i < 60; i++) {
    if ((await evalua('document.readyState').catch(() => null)) === 'complete') break
    await espera(200)
  }
  // La aplicación todavía tiene que leer IndexedDB y pintar.
  await espera(1200)
}

async function captura(nombre) {
  const { result } = await cdp('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: false,
  })
  if (!result?.data) throw new Error(`la captura de ${nombre} ha venido vacía`)
  const imagen = Buffer.from(result.data, 'base64')
  mkdirSync(SALIDA, { recursive: true })
  writeFileSync(join(SALIDA, nombre), imagen)
  console.log(`${nombre} · ${Math.round(imagen.length / 1024)} KB`)
}

/**
 * Datos de muestra. Se escriben directamente en IndexedDB en vez de crearlos
 * por la interfaz: son cuatro mazos, 113 cartas y medio millar de repasos, y
 * hacerlo a base de clics tardaría un cuarto de hora y saldría distinto cada vez.
 */
const SEMILLA = String.raw`
(async () => {
  const hoy = new Date()
  const iso = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
  const dias = (n) => { const d = new Date(hoy); d.setDate(d.getDate() + n); return d }
  const ahora = Date.now()

  const mazos = [
    { id: 'aaaaaaaa-0000-4000-8000-000000000001', name: 'Anatomía', emoji: '🩺', tags: [], total: 24, vencen: 6, dominadas: 9 },
    { id: 'aaaaaaaa-0000-4000-8000-000000000002', name: 'Capitales de Europa', emoji: '🌍', tags: [], total: 45, vencen: 12, dominadas: 20 },
    { id: 'aaaaaaaa-0000-4000-8000-000000000003', name: 'Ciencia básica', emoji: '🔬', tags: [], total: 26, vencen: 8, dominadas: 5 },
    // Sin icono a propósito: así se ve el monograma que sale cuando no lo tiene.
    { id: 'aaaaaaaa-0000-4000-8000-000000000005', name: 'Estructuras de datos', emoji: '', tags: ['examen enero'], total: 18, vencen: 4, dominadas: 2 },
  ]

  // Contenido de verdad donde se va a leer: la carta que sale en la captura de estudio.
  const contenido = {
    'aaaaaaaa-0000-4000-8000-000000000003': [
      ['¿Cuál es la fórmula de la energía cinética?', '$$\n E_c = \\frac{1}{2} m v^2\n$$\n\nAl doblar la velocidad, la energía se multiplica por cuatro.'],
      ['¿Cuál es el gas más abundante de la atmósfera terrestre?', 'El **nitrógeno**, alrededor del 78 %. El oxígeno es el 21 %.'],
      ['¿Cuántos cromosomas tiene una célula humana?', '**46**, agrupados en 23 pares.'],
    ],
  }

  const decks = []
  const cards = []
  for (const m of mazos) {
    decks.push({ id: m.id, name: m.name, emoji: m.emoji, description: '', tags: m.tags, createdAt: ahora - 86400000 * 40, updatedAt: ahora })
    const propio = contenido[m.id] ?? []
    for (let i = 0; i < m.total; i++) {
      // Las primeras vencen hoy, para que las de contenido real entren en la sesión.
      const vence = i < m.vencen
      const dominada = i >= m.vencen && i < m.vencen + m.dominadas
      const par = propio[i] ?? ['Pregunta de muestra ' + (i + 1), 'Respuesta de muestra ' + (i + 1)]
      cards.push({
        id: m.id + '-carta-' + String(i).padStart(3, '0'),
        deckId: m.id,
        front: par[0],
        back: par[1],
        mediaIds: [],
        box: dominada ? (i % 2 ? 5 : 4) : (i % 3) + 1,
        dueDate: iso(vence ? dias(0) : dias(1 + (i % 9))),
        reps: dominada ? 6 + (i % 4) : i % 3,
        lapses: i % 5 === 0 ? 1 : 0,
        lastReviewedAt: ahora - 86400000 * (1 + (i % 6)),
        suspended: false,
        createdAt: ahora - 86400000 * 40,
        updatedAt: ahora,
      })
    }
  }

  const logs = []
  for (let d = 29; d >= 0; d--) {
    // Algún día suelto sin estudiar, pero solo en las semanas viejas: la racha
    // de la cabecera es la de las dos últimas.
    const cuantos = d > 13 && d % 7 === 3 ? 0 : 8 + ((d * 7) % 23)
    for (let i = 0; i < cuantos; i++) {
      const carta = cards[(d * 13 + i * 7) % cards.length]
      const nota = i % 9 === 0 ? 'again' : i % 4 === 0 ? 'easy' : 'good'
      logs.push({
        id: 'log-' + logs.length,
        cardId: carta.id,
        deckId: carta.deckId,
        reviewedAt: dias(-d).setHours(19, 30, 0, 0),
        grade: nota,
        boxBefore: nota === 'again' ? 3 : 2,
        boxAfter: nota === 'again' ? 1 : 3,
      })
    }
  }

  const db = await new Promise((res, rej) => { const r = indexedDB.open('carti'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error) })
  const tiendas = ['decks', 'cards', 'reviewLogs', 'media']
  await new Promise((res, rej) => {
    const tx = db.transaction(tiendas, 'readwrite')
    for (const t of tiendas) tx.objectStore(t).clear()
    for (const d of decks) tx.objectStore('decks').put(d)
    for (const c of cards) tx.objectStore('cards').put(c)
    for (const l of logs) tx.objectStore('reviewLogs').put(l)
    tx.oncomplete = res
    tx.onerror = () => rej(tx.error)
  })
  db.close()
  return decks.length + ' mazos, ' + cards.length + ' cartas, ' + logs.length + ' repasos'
})()
`

/** Pasa cartas hasta dar con la de la fórmula y la deja girada. */
const BUSCA_LA_CARTA = String.raw`
(async () => {
  const espera = (ms) => new Promise((r) => setTimeout(r, ms))
  const toca = (el) => { if (!el) return false; for (const t of ['pointerdown','pointerup','click']) el.dispatchEvent(new PointerEvent(t, { bubbles: true, cancelable: true, pointerType: 'touch' })); return true }
  const boton = (texto) => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === texto)
  for (let i = 0; i < 40 && !document.querySelector('.flashcard__face--front'); i++) await espera(250)
  for (let vuelta = 0; vuelta < 30; vuelta++) {
    if ((document.querySelector('.flashcard__face--front')?.innerText ?? '').includes('cinética')) break
    if (!toca(boton('Ver la respuesta'))) break
    await espera(300)
    if (!toca([...document.querySelectorAll('.grade')].find((b) => b.textContent.includes('Bien')))) break
    await espera(450)
  }
  toca(boton('Ver la respuesta'))
  await espera(1800)
  return document.querySelector('.flashcard__face--back .katex-display') ? 'con la fórmula puesta' : 'sin fórmula'
})()
`

try {
  await cdp('Page.enable')
  await cdp('Runtime.enable')
  await cdp('Emulation.setDeviceMetricsOverride', PANTALLA)
  // Las capturas van en oscuro, que es como mejor se ve.
  await cdp('Emulation.setEmulatedMedia', {
    features: [{ name: 'prefers-color-scheme', value: 'dark' }],
  })

  // Primera visita: que la aplicación cree la base de datos con su esquema.
  await navega(APP)
  console.log(await evalua(SEMILLA))

  await navega(APP)
  await captura('mazos.png')

  // El progreso antes que el estudio: esa sesión califica cartas por el camino
  // y añadiría repasos de hoy a las gráficas.
  await navega(`${APP}estadisticas`)
  await captura('progreso.png')

  await navega(`${APP}mazo/aaaaaaaa-0000-4000-8000-000000000003/estudiar`)
  console.log(await evalua(BUSCA_LA_CARTA))
  await captura('estudio.png')
} finally {
  sock.close()
  proceso.kill()
}
