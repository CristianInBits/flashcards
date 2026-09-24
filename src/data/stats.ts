import { computeStreaks, summarizeStats, type Stats, type Streaks } from '../domain/stats'
import { today, toIsoDate } from '../lib/date'
import { db } from './db'

/**
 * Se leen todos los repasos, no solo los del rango de la gráfica: la racha más
 * larga puede ser de hace meses. Son unas pocas filas por día de uso, así que
 * cabe de sobra en memoria.
 */
export async function loadStats(rangeDays: number): Promise<Stats> {
  const [logs, cards] = await Promise.all([db.reviewLogs.toArray(), db.cards.toArray()])
  return summarizeStats(logs, cards, today(), rangeDays)
}

/** Solo la racha, para la cabecera: no hace falta leer también las cartas. */
export async function loadStreak(): Promise<Streaks> {
  const logs = await db.reviewLogs.toArray()
  return computeStreaks(
    logs.map((log) => toIsoDate(new Date(log.reviewedAt))),
    today(),
  )
}
