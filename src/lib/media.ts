/**
 * Las imágenes no caben en el Markdown: viven como blobs en IndexedDB y en el
 * texto solo queda una referencia `![descripción](carti:<id>)`.
 *
 * Se usa un esquema propio en vez de una URL de objeto porque las URL de objeto
 * mueren al recargar la página, y el texto de la carta se guarda para siempre.
 */
export const MEDIA_SCHEME = 'carti:'

/** El id es un uuid, y el patrón es estricto para no confundirlo con texto suelto. */
const MEDIA_REFERENCE = /carti:([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/gi

export function mediaUrl(id: string): string {
  return `${MEDIA_SCHEME}${id}`
}

export function parseMediaUrl(url: string): string | null {
  if (!url.toLowerCase().startsWith(MEDIA_SCHEME)) return null
  const id = url.slice(MEDIA_SCHEME.length)
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id) ? id : null
}

/** Identificadores citados en un texto, sin repetir. Sirve para saber qué imágenes sobran. */
export function extractMediaIds(...markdown: string[]): string[] {
  const ids = new Set<string>()
  for (const text of markdown) {
    for (const match of text.matchAll(MEDIA_REFERENCE)) {
      ids.add(match[1].toLowerCase())
    }
  }
  return [...ids]
}
