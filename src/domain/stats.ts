import { addDays, daysUntil, toIsoDate, type IsoDate } from '../lib/date'
import type { Box, Card, ReviewLog } from './types'

/**
 * Estadísticas a partir del histórico de repasos.
 *
 * Todo se calcula desde `reviewLogs`, que nunca se edita: las cifras salen de
 * lo que realmente pasó, no de contadores que haya que mantener al día y que
 * acaban descuadrándose.
 */

export interface DailyCount {
  date: IsoDate
  reviews: number
  /** Respuestas distintas de «Mal». */
  correct: number
}

export interface Streaks {
  current: number
  longest: number
  studiedToday: boolean
}

export interface Stats {
  totalReviews: number
  /** Proporción de aciertos, o null si todavía no has repasado nada. */
  accuracy: number | null
  streaks: Streaks
  daily: DailyCount[]
  boxes: Record<Box, number>
  cards: number
  dueToday: number
}

/** Días naturales del rango, ambos incluidos, en orden ascendente. */
export function eachDay(from: IsoDate, to: IsoDate): IsoDate[] {
  const days: IsoDate[] = []
  for (let date = from; date <= to; date = addDays(date, 1)) days.push(date)
  return days
}

/**
 * Cuenta por día, rellenando con ceros los días sin repasos: una gráfica con
 * huecos mentiría sobre la constancia.
 */
export function buildDailyCounts(
  logs: readonly ReviewLog[],
  from: IsoDate,
  to: IsoDate,
): DailyCount[] {
  const byDate = new Map<IsoDate, DailyCount>()
  for (const date of eachDay(from, to)) {
    byDate.set(date, { date, reviews: 0, correct: 0 })
  }

  for (const log of logs) {
    const date = toIsoDate(new Date(log.reviewedAt))
    const entry = byDate.get(date)
    if (!entry) continue
    entry.reviews += 1
    if (log.grade !== 'again') entry.correct += 1
  }

  return [...byDate.values()]
}

/**
 * Racha de días seguidos estudiando.
 *
 * Si el último día con repasos es ayer la racha sigue viva: todavía tienes el
 * día de hoy por delante para no romperla. Solo se pone a cero cuando ya has
 * dejado pasar un día entero.
 */
export function computeStreaks(dates: readonly IsoDate[], today: IsoDate): Streaks {
  const unique = [...new Set(dates)].sort()
  if (unique.length === 0) return { current: 0, longest: 0, studiedToday: false }

  let longest = 1
  let run = 1
  for (let i = 1; i < unique.length; i++) {
    run = daysUntil(unique[i], unique[i - 1]) === 1 ? run + 1 : 1
    if (run > longest) longest = run
  }

  const last = unique[unique.length - 1]
  const gap = daysUntil(today, last)

  let current = 0
  if (gap === 0 || gap === 1) {
    current = 1
    for (let i = unique.length - 1; i > 0; i--) {
      if (daysUntil(unique[i], unique[i - 1]) !== 1) break
      current += 1
    }
  }

  return { current, longest, studiedToday: gap === 0 }
}

export function summarizeStats(
  logs: readonly ReviewLog[],
  cards: readonly Card[],
  today: IsoDate,
  rangeDays: number,
): Stats {
  const from = addDays(today, -(rangeDays - 1))
  const daily = buildDailyCounts(logs, from, today)

  const correct = logs.filter((log) => log.grade !== 'again').length
  const dates = logs.map((log) => toIsoDate(new Date(log.reviewedAt)))

  const boxes: Record<Box, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  let dueToday = 0
  for (const card of cards) {
    if (card.suspended) continue
    boxes[card.box] += 1
    if (card.dueDate <= today) dueToday += 1
  }

  return {
    totalReviews: logs.length,
    accuracy: logs.length > 0 ? correct / logs.length : null,
    streaks: computeStreaks(dates, today),
    daily,
    boxes,
    cards: cards.filter((card) => !card.suspended).length,
    dueToday,
  }
}
