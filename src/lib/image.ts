/**
 * Prepara una imagen antes de guardarla.
 *
 * Una foto de móvil son cuatro o cinco megas, y aquí todo se guarda en el
 * dispositivo y acaba también en la copia de seguridad. Reducirlas no es una
 * optimización prematura: es la diferencia entre un backup de 2 MB y uno de 80.
 */

/** Lado mayor máximo. Da de sobra para un esquema visto en un móvil. */
const MAX_DIMENSION = 1600

/** Por debajo de esto no se toca nada: reencodear solo empeoraría. */
const SIZE_THRESHOLD = 500_000

/**
 * WebP con calidad alta. Bastante por encima del 0,8 habitual de las fotos
 * porque aquí hay esquemas y capturas con texto, y el texto es lo primero que
 * se emborrona al comprimir.
 */
const QUALITY = 0.9

export interface PreparedImage {
  blob: Blob
  mime: string
}

export async function prepareImage(file: File): Promise<PreparedImage> {
  // Los vectores y los animados se guardan tal cual: redibujarlos en un canvas
  // le quitaría al SVG su escalado y al GIF su animación.
  if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return { blob: file, mime: file.type }
  }

  let bitmap: ImageBitmap
  try {
    bitmap = await createImageBitmap(file)
  } catch {
    // Formato que el navegador no sabe decodificar: se guarda como venga.
    return { blob: file, mime: file.type || 'application/octet-stream' }
  }

  try {
    const longest = Math.max(bitmap.width, bitmap.height)
    if (longest <= MAX_DIMENSION && file.size <= SIZE_THRESHOLD) {
      return { blob: file, mime: file.type }
    }

    const scale = Math.min(1, MAX_DIMENSION / longest)
    const width = Math.round(bitmap.width * scale)
    const height = Math.round(bitmap.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const context = canvas.getContext('2d')
    if (!context) return { blob: file, mime: file.type }
    context.drawImage(bitmap, 0, 0, width, height)

    const blob = await toBlob(canvas, 'image/webp', QUALITY)
    // Si el navegador no sabe escribir WebP, `toBlob` devuelve un PNG o nada.
    if (!blob) return { blob: file, mime: file.type }

    // Si el resultado pesa más que el original, el original gana.
    return blob.size < file.size ? { blob, mime: blob.type } : { blob: file, mime: file.type }
  } finally {
    bitmap.close()
  }
}

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality))
}

/** Tamaño legible, para poder avisar de lo que ocupa una copia de seguridad. */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} kB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
