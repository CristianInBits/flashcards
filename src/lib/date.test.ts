import { describe, expect, it } from 'vitest'

import { addDays, daysUntil, fromIsoDate, isDue, today, toIsoDate } from './date'

describe('toIsoDate', () => {
  it('usa la fecha local, no la UTC', () => {
    // A las 23:50 la fecha local sigue siendo la de hoy aunque en UTC ya sea mañana.
    expect(toIsoDate(new Date(2026, 0, 5, 23, 50))).toBe('2026-01-05')
    expect(toIsoDate(new Date(2026, 0, 6, 0, 10))).toBe('2026-01-06')
  })

  it('rellena con ceros meses y días de una cifra', () => {
    expect(toIsoDate(new Date(2026, 2, 7))).toBe('2026-03-07')
  })
})

describe('addDays', () => {
  it('suma días dentro del mismo mes', () => {
    expect(addDays('2026-03-07', 4)).toBe('2026-03-11')
  })

  it('cruza el cambio de mes y de año', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01')
    expect(addDays('2026-12-28', 16)).toBe('2027-01-13')
  })

  it('acierta con los años bisiestos', () => {
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29')
    expect(addDays('2026-02-28', 1)).toBe('2026-03-01')
  })

  it('admite restar', () => {
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
  })

  it('cubre los intervalos de Leitner desde un mismo día', () => {
    const intervals = [1, 2, 4, 8, 16]
    expect(intervals.map((days) => addDays('2026-05-20', days))).toEqual([
      '2026-05-21',
      '2026-05-22',
      '2026-05-24',
      '2026-05-28',
      '2026-06-05',
    ])
  })
})

describe('isDue', () => {
  it('considera vencidas las de hoy y las atrasadas', () => {
    expect(isDue('2026-05-20', '2026-05-20')).toBe(true)
    expect(isDue('2026-05-19', '2026-05-20')).toBe(true)
  })

  it('no considera vencidas las futuras', () => {
    expect(isDue('2026-05-21', '2026-05-20')).toBe(false)
  })
})

describe('today', () => {
  it('devuelve la fecha del momento que se le pase', () => {
    expect(today(new Date(2026, 8, 23, 14, 0))).toBe('2026-09-23')
  })
})

describe('fromIsoDate', () => {
  it('devuelve la medianoche local de ese día', () => {
    const date = fromIsoDate('2026-05-20')
    expect(date.getFullYear()).toBe(2026)
    expect(date.getMonth()).toBe(4)
    expect(date.getDate()).toBe(20)
    expect(date.getHours()).toBe(0)
  })

  it('es la operación inversa de toIsoDate', () => {
    expect(toIsoDate(fromIsoDate('2026-02-29'))).toBe('2026-03-01')
    expect(toIsoDate(fromIsoDate('2028-02-29'))).toBe('2028-02-29')
  })
})

describe('daysUntil', () => {
  it('cuenta los días que faltan', () => {
    expect(daysUntil('2026-05-21', '2026-05-20')).toBe(1)
    expect(daysUntil('2026-06-05', '2026-05-20')).toBe(16)
  })

  it('hoy son cero días', () => {
    expect(daysUntil('2026-05-20', '2026-05-20')).toBe(0)
  })

  it('una fecha pasada da negativo', () => {
    expect(daysUntil('2026-05-18', '2026-05-20')).toBe(-2)
  })

  it('el cambio de hora no descuadra la cuenta', () => {
    // En España el horario de verano entra el último domingo de marzo: ese día
    // tiene 23 horas, y sin redondear la diferencia saldría 0,95 días.
    expect(daysUntil('2026-03-30', '2026-03-29')).toBe(1)
    // Y el de invierno, el último domingo de octubre, tiene 25.
    expect(daysUntil('2026-10-26', '2026-10-25')).toBe(1)
  })
})
