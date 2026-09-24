/**
 * Fechas de repaso en formato 'YYYY-MM-DD' y **siempre en hora local**.
 *
 * Nada de marcas de tiempo ni de UTC: si estudias a las 23:50 y vuelves a las
 * 00:10, tienen que ser dos días distintos. Usar `toISOString()` rompería esto
 * en cualquier huso que no sea UTC.
 */
export type IsoDate = string

export function toIsoDate(date: Date): IsoDate {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function today(now: Date = new Date()): IsoDate {
  return toIsoDate(now)
}

/** Suma días naturales. Construye la fecha a medianoche local, así el cambio de hora no descuadra nada. */
export function addDays(date: IsoDate, days: number): IsoDate {
  const [year, month, day] = date.split('-').map(Number)
  const result = new Date(year, month - 1, day)
  result.setDate(result.getDate() + days)
  return toIsoDate(result)
}

/** Una carta está vencida si su fecha es hoy o anterior. */
export function isDue(dueDate: IsoDate, reference: IsoDate = today()): boolean {
  return dueDate <= reference
}

/** Convierte a Date a medianoche local, para poder darle formato. */
export function fromIsoDate(date: IsoDate): Date {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/** Días naturales que faltan. Negativo si la fecha ya pasó, 0 si es hoy. */
export function daysUntil(date: IsoDate, reference: IsoDate = today()): number {
  const from = fromIsoDate(reference).getTime()
  const to = fromIsoDate(date).getTime()
  // Se redondea porque entre las dos fechas puede haber un cambio de hora,
  // y entonces la diferencia no son exactamente 24 h por día.
  return Math.round((to - from) / 86_400_000)
}
