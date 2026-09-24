import { describe, expect, it } from 'vitest'

import { buildDailyCounts, computeStreaks, eachDay, summarizeStats } from './stats'
import type { Card, Grade, ReviewLog } from './types'

/** Un repaso el día indicado, al mediodía para no rozar la frontera del día. */
function log(date: string, grade: Grade = 'good'): ReviewLog {
  const [year, month, day] = date.split('-').map(Number)
  return {
    id: `${date}-${grade}-${Math.random()}`,
    cardId: 'c1',
    deckId: 'd1',
    reviewedAt: new Date(year, month - 1, day, 12, 0).getTime(),
    grade,
    boxBefore: 1,
    boxAfter: 2,
  }
}

function card(overrides: Partial<Card> = {}): Card {
  return {
    id: `c${Math.random()}`,
    deckId: 'd1',
    front: 'a',
    back: 'b',
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

describe('eachDay', () => {
  it('incluye los dos extremos', () => {
    expect(eachDay('2026-05-18', '2026-05-20')).toEqual(['2026-05-18', '2026-05-19', '2026-05-20'])
  })

  it('un solo día', () => {
    expect(eachDay('2026-05-20', '2026-05-20')).toEqual(['2026-05-20'])
  })

  it('cruza el cambio de mes', () => {
    expect(eachDay('2026-01-30', '2026-02-02')).toHaveLength(4)
  })
})

describe('buildDailyCounts', () => {
  it('cuenta los repasos de cada día', () => {
    const logs = [log('2026-05-20'), log('2026-05-20'), log('2026-05-19')]
    const daily = buildDailyCounts(logs, '2026-05-19', '2026-05-20')
    expect(daily).toEqual([
      { date: '2026-05-19', reviews: 1, correct: 1 },
      { date: '2026-05-20', reviews: 2, correct: 2 },
    ])
  })

  it('rellena con ceros los días sin repasos', () => {
    const daily = buildDailyCounts([log('2026-05-20')], '2026-05-18', '2026-05-20')
    expect(daily.map((d) => d.reviews)).toEqual([0, 0, 1])
  })

  it('«Mal» cuenta como repaso pero no como acierto', () => {
    const logs = [log('2026-05-20', 'again'), log('2026-05-20', 'easy')]
    const [day] = buildDailyCounts(logs, '2026-05-20', '2026-05-20')
    expect(day).toEqual({ date: '2026-05-20', reviews: 2, correct: 1 })
  })

  it('ignora lo que cae fuera del rango', () => {
    const logs = [log('2026-05-01'), log('2026-05-20')]
    const daily = buildDailyCounts(logs, '2026-05-19', '2026-05-20')
    expect(daily.reduce((sum, d) => sum + d.reviews, 0)).toBe(1)
  })
})

describe('computeStreaks', () => {
  it('sin repasos no hay racha', () => {
    expect(computeStreaks([], '2026-05-20')).toEqual({
      current: 0,
      longest: 0,
      studiedToday: false,
    })
  })

  it('cuenta los días seguidos hasta hoy', () => {
    const dates = ['2026-05-18', '2026-05-19', '2026-05-20']
    expect(computeStreaks(dates, '2026-05-20')).toMatchObject({ current: 3, studiedToday: true })
  })

  it('la racha sigue viva si el último día fue ayer', () => {
    // Todavía queda el día de hoy para no romperla.
    const dates = ['2026-05-18', '2026-05-19']
    expect(computeStreaks(dates, '2026-05-20')).toMatchObject({ current: 2, studiedToday: false })
  })

  it('se rompe al dejar pasar un día entero', () => {
    const dates = ['2026-05-17', '2026-05-18']
    expect(computeStreaks(dates, '2026-05-20')).toMatchObject({ current: 0, studiedToday: false })
  })

  it('varios repasos el mismo día cuentan como un día', () => {
    const dates = ['2026-05-20', '2026-05-20', '2026-05-20']
    expect(computeStreaks(dates, '2026-05-20').current).toBe(1)
  })

  it('recuerda la racha más larga aunque la actual se haya roto', () => {
    const dates = [
      '2026-05-01',
      '2026-05-02',
      '2026-05-03',
      '2026-05-04',
      '2026-05-19',
      '2026-05-20',
    ]
    expect(computeStreaks(dates, '2026-05-20')).toMatchObject({ current: 2, longest: 4 })
  })

  it('no se lía con las fechas desordenadas', () => {
    const dates = ['2026-05-20', '2026-05-18', '2026-05-19']
    expect(computeStreaks(dates, '2026-05-20').current).toBe(3)
  })

  it('cuenta bien a través del cambio de mes', () => {
    const dates = ['2026-01-30', '2026-01-31', '2026-02-01']
    expect(computeStreaks(dates, '2026-02-01').current).toBe(3)
  })
})

describe('summarizeStats', () => {
  it('resume repasos, aciertos y cajas', () => {
    const logs = [log('2026-05-20'), log('2026-05-20', 'again'), log('2026-05-19', 'easy')]
    const cards = [card({ box: 1 }), card({ box: 3 }), card({ box: 3 })]

    const stats = summarizeStats(logs, cards, '2026-05-20', 7)

    expect(stats.totalReviews).toBe(3)
    expect(stats.accuracy).toBeCloseTo(2 / 3)
    expect(stats.boxes).toEqual({ 1: 1, 2: 0, 3: 2, 4: 0, 5: 0 })
    expect(stats.daily).toHaveLength(7)
    expect(stats.cards).toBe(3)
  })

  it('sin repasos la precisión es nula, no cero', () => {
    // Cero por ciento de aciertos y «todavía no has repasado» no son lo mismo.
    expect(summarizeStats([], [card()], '2026-05-20', 7).accuracy).toBeNull()
  })

  it('cuenta las vencidas de hoy y las atrasadas', () => {
    const cards = [
      card({ dueDate: '2026-05-18' }),
      card({ dueDate: '2026-05-20' }),
      card({ dueDate: '2026-05-25' }),
    ]
    expect(summarizeStats([], cards, '2026-05-20', 7).dueToday).toBe(2)
  })

  it('las cartas suspendidas no entran en las cuentas', () => {
    const cards = [card(), card({ suspended: true, box: 4 })]
    const stats = summarizeStats([], cards, '2026-05-20', 7)
    expect(stats.cards).toBe(1)
    expect(stats.boxes[4]).toBe(0)
  })
})
