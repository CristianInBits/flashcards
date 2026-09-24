import { describe, expect, it } from 'vitest'

import { BOX_INTERVALS, gradeCard, nextBox } from './leitner'
import type { Box, Card } from './types'

function card(overrides: Partial<Card> = {}): Card {
  return {
    id: 'c1',
    deckId: 'd1',
    front: 'pregunta',
    back: 'respuesta',
    mediaIds: [],
    box: 1,
    dueDate: '2026-05-20',
    reps: 0,
    lapses: 0,
    suspended: false,
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  }
}

/** Mediodía, para que ninguna prueba dependa de la frontera del día. */
const NOW = new Date(2026, 4, 20, 12, 0)

describe('nextBox', () => {
  it('Mal reinicia a la caja 1 desde cualquier caja', () => {
    const boxes: Box[] = [1, 2, 3, 4, 5]
    expect(boxes.map((box) => nextBox(box, 'again'))).toEqual([1, 1, 1, 1, 1])
  })

  it('Bien sube una caja', () => {
    expect(nextBox(1, 'good')).toBe(2)
    expect(nextBox(4, 'good')).toBe(5)
  })

  it('Fácil sube dos cajas', () => {
    expect(nextBox(1, 'easy')).toBe(3)
    expect(nextBox(3, 'easy')).toBe(5)
  })

  it('no pasa de la caja 5', () => {
    expect(nextBox(5, 'good')).toBe(5)
    expect(nextBox(5, 'easy')).toBe(5)
    expect(nextBox(4, 'easy')).toBe(5)
  })
})

describe('gradeCard', () => {
  it('Bien desde la caja 1 pasa a la 2 y vuelve en 2 días', () => {
    const { card: updated } = gradeCard(card({ box: 1 }), 'good', NOW)
    expect(updated.box).toBe(2)
    expect(updated.dueDate).toBe('2026-05-22')
  })

  it('Fácil desde la caja 1 pasa a la 3 y vuelve en 4 días', () => {
    const { card: updated } = gradeCard(card({ box: 1 }), 'easy', NOW)
    expect(updated.box).toBe(3)
    expect(updated.dueDate).toBe('2026-05-24')
  })

  it('Mal manda a la caja 1 y la carta vuelve mañana', () => {
    const { card: updated } = gradeCard(card({ box: 4 }), 'again', NOW)
    expect(updated.box).toBe(1)
    expect(updated.dueDate).toBe('2026-05-21')
  })

  it('la caja 5 acertada se queda en la 5 y vuelve en 16 días', () => {
    const { card: updated } = gradeCard(card({ box: 5 }), 'good', NOW)
    expect(updated.box).toBe(5)
    expect(updated.dueDate).toBe('2026-06-05')
  })

  it('cada caja usa su intervalo', () => {
    const dueDates = ([1, 2, 3, 4, 5] as Box[]).map(
      (box) => gradeCard(card({ box }), 'again', NOW).card.dueDate,
    )
    // Todas caen a la caja 1, así que todas vuelven mañana
    expect(new Set(dueDates)).toEqual(new Set(['2026-05-21']))

    expect(BOX_INTERVALS).toEqual({ 1: 1, 2: 2, 3: 4, 4: 8, 5: 16 })
  })

  it('cuenta el repaso siempre', () => {
    expect(gradeCard(card({ reps: 7 }), 'good', NOW).card.reps).toBe(8)
    expect(gradeCard(card({ reps: 7 }), 'again', NOW).card.reps).toBe(8)
  })

  it('solo cuenta recaída si la carta venía de más arriba', () => {
    // Fallar una carta que ya estaba en la caja 1 es aprender, no recaer.
    expect(gradeCard(card({ box: 1, lapses: 0 }), 'again', NOW).card.lapses).toBe(0)
    expect(gradeCard(card({ box: 2, lapses: 0 }), 'again', NOW).card.lapses).toBe(1)
    expect(gradeCard(card({ box: 5, lapses: 3 }), 'again', NOW).card.lapses).toBe(4)
  })

  it('acertar no cuenta como recaída', () => {
    expect(gradeCard(card({ box: 3, lapses: 2 }), 'good', NOW).card.lapses).toBe(2)
  })

  it('no toca el contenido de la carta', () => {
    const original = card({ front: '¿Qué?', back: 'Eso' })
    const { card: updated } = gradeCard(original, 'good', NOW)
    expect(updated.front).toBe('¿Qué?')
    expect(updated.back).toBe('Eso')
    expect(updated.id).toBe(original.id)
  })

  it('no muta la carta original', () => {
    const original = card({ box: 1, reps: 0 })
    gradeCard(original, 'good', NOW)
    expect(original.box).toBe(1)
    expect(original.reps).toBe(0)
  })

  it('deja el registro del repaso listo para guardar', () => {
    const { log } = gradeCard(card({ box: 2 }), 'easy', NOW)
    expect(log).toEqual({
      cardId: 'c1',
      deckId: 'd1',
      reviewedAt: NOW.getTime(),
      grade: 'easy',
      boxBefore: 2,
      boxAfter: 4,
    })
  })

  it('usa el día local, no el UTC, cerca de medianoche', () => {
    // A las 23:50 del 20 la fecha local sigue siendo el 20, así que Bien
    // desde la caja 1 vence el 22, no el 23.
    const lateNight = new Date(2026, 4, 20, 23, 50)
    expect(gradeCard(card({ box: 1 }), 'good', lateNight).card.dueDate).toBe('2026-05-22')
  })
})
