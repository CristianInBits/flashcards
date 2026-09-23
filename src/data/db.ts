import Dexie, { type EntityTable } from 'dexie'

import type { Card, Deck, MediaItem, ReviewLog } from '../domain/types'

/**
 * Base de datos local. Todo vive en IndexedDB, en este dispositivo y en ningún otro sitio.
 *
 * Sobre los índices: `[deckId+dueDate]` es el importante, porque la consulta que más se va a
 * repetir es «dame las cartas vencidas de este mazo». `*tags` es multi-entrada: indexa cada
 * etiqueta por separado para poder filtrar por una sola.
 *
 * Al cambiar el esquema hay que **subir la versión**, nunca editar la existente: los
 * navegadores que ya tengan datos aplican las migraciones por orden.
 */
class CartiDatabase extends Dexie {
  decks!: EntityTable<Deck, 'id'>
  cards!: EntityTable<Card, 'id'>
  reviewLogs!: EntityTable<ReviewLog, 'id'>
  media!: EntityTable<MediaItem, 'id'>

  constructor() {
    super('carti')

    this.version(1).stores({
      decks: 'id, name, updatedAt, *tags',
      cards: 'id, deckId, dueDate, [deckId+dueDate], updatedAt',
      reviewLogs: 'id, cardId, deckId, reviewedAt',
      media: 'id',
    })
  }
}

export const db = new CartiDatabase()

export function newId(): string {
  return crypto.randomUUID()
}
