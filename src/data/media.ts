import { prepareImage } from '../lib/image'
import { extractMediaIds } from '../lib/media'
import type { MediaItem } from '../domain/types'
import { db, newId } from './db'

export async function storeImage(file: File): Promise<MediaItem> {
  const { blob, mime } = await prepareImage(file)
  const item: MediaItem = { id: newId(), blob, mime, createdAt: Date.now() }
  await db.media.add(item)
  return item
}

export function getMedia(id: string): Promise<MediaItem | undefined> {
  return db.media.get(id)
}

/**
 * Borra las imágenes que ya no cita ninguna carta.
 *
 * Se recorren todas las cartas en vez de llevar un contador de referencias:
 * con unos cientos de cartas cuesta milisegundos, y un contador mal llevado
 * deja basura invisible o, peor, borra una imagen que sí se estaba usando.
 */
export async function pruneOrphanMedia(): Promise<number> {
  return db.transaction('rw', db.cards, db.media, async () => {
    const cards = await db.cards.toArray()
    const used = new Set(cards.flatMap((card) => extractMediaIds(card.front, card.back)))

    const stored = await db.media.toCollection().primaryKeys()
    const orphans = stored.filter((id) => !used.has(String(id)))

    if (orphans.length > 0) await db.media.bulkDelete(orphans)
    return orphans.length
  })
}

/** Cuánto ocupan las imágenes, para poder avisar antes de exportar. */
export async function mediaSize(): Promise<number> {
  const items = await db.media.toArray()
  return items.reduce((total, item) => total + item.blob.size, 0)
}
