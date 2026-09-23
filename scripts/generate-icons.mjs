/**
 * Genera los iconos de la PWA a partir de assets/icon-source.png.
 *
 *   npm run icons
 *
 * La variante «maskable» lleva margen extra a propósito: Android recorta el
 * icono con máscaras de formas distintas según el lanzador, y solo garantiza
 * que se vea el círculo central del 80%. El icono original llega casi al borde,
 * así que se reescala al 76% sobre su propio color de fondo.
 */
import { mkdir } from 'node:fs/promises'
import sharp from 'sharp'

const SOURCE = 'assets/icon-source.png'
const MASKABLE_SCALE = 0.76

// El diseño es plano: una paleta indexada lo aligera bastante sin diferencia
// visible, y estos ficheros van al precaché del service worker.
const PNG_OPTIONS = { palette: true, effort: 9 }

/** Iconos que usan el original tal cual. */
const PLAIN = [
  { file: 'public/icons/icon-192.png', size: 192 },
  { file: 'public/icons/icon-512.png', size: 512 },
  { file: 'public/icons/favicon-32.png', size: 32 },
  // iOS no aplica máscara: recorta a esquinas redondeadas y no respeta la transparencia.
  { file: 'public/apple-touch-icon.png', size: 180 },
]

/**
 * Color de fondo del icono, leído de su esquina superior izquierda.
 * Se muestrea en vez de fijarse a mano para que al cambiar el icono no quede
 * un recuadro de otro color alrededor del maskable.
 */
async function readBackgroundColor(file) {
  const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true })
  const [r, g, b] = data.subarray(0, 3)
  const hex = `#${[r, g, b].map((value) => value.toString(16).padStart(2, '0')).join('')}`
  return { r, g, b, hex, size: `${info.width}×${info.height}` }
}

const background = await readBackgroundColor(SOURCE)
console.log(`Origen: ${SOURCE} (${background.size}), fondo ${background.hex}`)

await mkdir('public/icons', { recursive: true })

for (const { file, size } of PLAIN) {
  await sharp(SOURCE).resize(size, size, { fit: 'cover' }).png(PNG_OPTIONS).toFile(file)
  console.log(`✓ ${file} (${size}×${size})`)
}

const maskableSize = 512
const innerSize = Math.round(maskableSize * MASKABLE_SCALE)
const inner = await sharp(SOURCE).resize(innerSize, innerSize, { fit: 'cover' }).png().toBuffer()

await sharp({
  create: {
    width: maskableSize,
    height: maskableSize,
    channels: 3,
    background: { r: background.r, g: background.g, b: background.b },
  },
})
  .composite([{ input: inner, gravity: 'centre' }])
  .png(PNG_OPTIONS)
  .toFile('public/icons/icon-maskable-512.png')

console.log(`✓ public/icons/icon-maskable-512.png (${maskableSize}×${maskableSize}, maskable)`)
