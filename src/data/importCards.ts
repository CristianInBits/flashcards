import type { ParsedCard } from '../domain/import'
import { today } from '../lib/date'
import { extractMediaIds } from '../lib/media'
import type { Card } from '../domain/types'
import { db, newId } from './db'

/**
 * Mete en un mazo las cartas que ha devuelto el parser.
 *
 * Todas nacen en la caja 1 y vencidas hoy, igual que si las hubieras escrito a
 * mano: importar doscientas cartas no debería saltarse la cola de repaso.
 */
export async function importCards(deckId: string, parsed: ParsedCard[]): Promise<number> {
  if (parsed.length === 0) return 0

  const now = Date.now()
  const dueDate = today()

  const cards: Card[] = parsed.map((card, index) => ({
    id: newId(),
    deckId,
    front: card.front,
    back: card.back,
    mediaIds: extractMediaIds(card.front, card.back),
    box: 1,
    dueDate,
    reps: 0,
    lapses: 0,
    suspended: false,
    // El índice mantiene el orden del fichero dentro del mismo milisegundo.
    createdAt: now + index,
    updatedAt: now + index,
  }))

  await db.cards.bulkAdd(cards)
  return cards.length
}
