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
