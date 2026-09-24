import type { GradedCard } from '../domain/leitner'
import { db, newId } from './db'

/**
 * Guarda el resultado de un repaso: la carta con su caja y fecha nuevas, y el
 * registro histórico.
 *
 * En una transacción porque son dos escrituras que tienen que ir juntas: una
 * carta que avanza de caja sin su registro descuadraría las estadísticas, y un
 * registro sin la carta actualizada haría que la carta volviera a salir hoy.
 */
export async function saveReview({ card, log }: GradedCard): Promise<void> {
  await db.transaction('rw', db.cards, db.reviewLogs, async () => {
    await db.cards.put(card)
    await db.reviewLogs.add({ ...log, id: newId() })
  })
}
