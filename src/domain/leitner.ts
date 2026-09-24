import { addDays, today, type IsoDate } from '../lib/date'
import type { Box, Card, Grade, ReviewLog } from './types'

/**
 * Leitner de cinco cajas. Cada caja tiene un intervalo fijo en días: cuanto
 * mejor te sabes una carta, más arriba está y menos la ves.
 *
 * Todo lo de aquí son funciones puras —entran datos, salen datos— y por eso
 * están cubiertas por tests. Cambiar a FSRS algún día es sustituir este fichero,
 * no reescribir la aplicación.
 */
export const BOX_INTERVALS: Record<Box, number> = {
  1: 1,
  2: 2,
  3: 4,
  4: 8,
  5: 16,
}

export const MAX_BOX: Box = 5

/**
 * Mal reinicia a la caja 1, Bien sube una y Fácil sube dos, sin pasar de la 5.
 * No hay estado «aprendida»: una carta en la caja 5 sigue volviendo cada 16 días.
 */
export function nextBox(box: Box, grade: Grade): Box {
  if (grade === 'again') return 1
  const step = grade === 'easy' ? 2 : 1
  return Math.min(box + step, MAX_BOX) as Box
}

export interface GradedCard {
  card: Card
  log: Omit<ReviewLog, 'id'>
}

/**
 * Aplica una calificación a una carta y devuelve cómo queda, junto con el
 * registro del repaso.
 *
 * `now` se puede inyectar para los tests. La fecha de vencimiento se calcula
 * siempre en días naturales locales, nunca en marcas de tiempo.
 */
export function gradeCard(card: Card, grade: Grade, now: Date = new Date()): GradedCard {
  const reference: IsoDate = today(now)
  const boxBefore = card.box
  const boxAfter = nextBox(boxBefore, grade)

  return {
    card: {
      ...card,
      box: boxAfter,
      dueDate: addDays(reference, BOX_INTERVALS[boxAfter]),
      reps: card.reps + 1,
      // Solo cuenta como recaída si venía de más arriba: fallar una carta que
      // ya estaba en la caja 1 es lo normal mientras la aprendes.
      lapses: grade === 'again' && boxBefore > 1 ? card.lapses + 1 : card.lapses,
      lastReviewedAt: now.getTime(),
      updatedAt: now.getTime(),
    },
    log: {
      cardId: card.id,
      deckId: card.deckId,
      reviewedAt: now.getTime(),
      grade,
      boxBefore,
      boxAfter,
    },
  }
}
