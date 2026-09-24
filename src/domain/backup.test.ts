import { describe, expect, it } from 'vitest'

import { BACKUP_FORMAT, InvalidBackupError, summarizeBackup, validateBackup } from './backup'

const deck = {
  id: 'd1',
  name: 'Mazo',
  description: '',
  tags: ['prueba'],
  createdAt: 1,
  updatedAt: 2,
}

const card = {
  id: 'c1',
  deckId: 'd1',
  front: 'pregunta',
  back: 'respuesta',
  mediaIds: [],
  box: 2,
  dueDate: '2026-05-20',
  reps: 3,
  lapses: 1,
  suspended: false,
  createdAt: 1,
  updatedAt: 2,
}

const log = {
  id: 'l1',
  cardId: 'c1',
  deckId: 'd1',
  reviewedAt: 100,
  grade: 'good',
  boxBefore: 1,
  boxAfter: 2,
}

function backup(overrides: Record<string, unknown> = {}) {
  return {
    format: BACKUP_FORMAT,
    version: 1,
    exportedAt: '2026-05-20T10:00:00.000Z',
    decks: [deck],
    cards: [card],
    reviewLogs: [log],
    media: [],
    ...overrides,
  }
}

describe('validateBackup', () => {
  it('acepta una copia bien formada', () => {
    const result = validateBackup(backup())
    expect(result.decks).toHaveLength(1)
    expect(result.cards[0].box).toBe(2)
  })

  it('rechaza lo que no es un objeto', () => {
    expect(() => validateBackup('hola')).toThrow(InvalidBackupError)
    expect(() => validateBackup(null)).toThrow(InvalidBackupError)
    expect(() => validateBackup([])).toThrow(InvalidBackupError)
  })

  it('rechaza un JSON de otra aplicación', () => {
    expect(() => validateBackup({ decks: [], cards: [] })).toThrow(
      /no parece una copia de seguridad/i,
    )
  })

  it('rechaza una versión más nueva de la que entiende', () => {
    expect(() => validateBackup(backup({ version: 99 }))).toThrow(/versión más nueva/i)
  })

  it('avisa de las listas que faltan', () => {
    expect(() => validateBackup(backup({ cards: undefined }))).toThrow(/lista de cartas/i)
    expect(() => validateBackup(backup({ media: undefined }))).toThrow(/lista de imágenes/i)
  })

  it('rechaza una carta sin los campos obligatorios', () => {
    const roto = { ...card, front: undefined }
    expect(() => validateBackup(backup({ cards: [roto] }))).toThrow(/front/)
  })

  it('rechaza cartas cuyo mazo no está en el fichero', () => {
    const suelta = { ...card, deckId: 'otro' }
    expect(() => validateBackup(backup({ cards: [suelta] }))).toThrow(/apuntan a un mazo/i)
  })

  it('rellena los campos opcionales que falten', () => {
    const escueto = {
      id: 'c2',
      deckId: 'd1',
      front: 'a',
      back: 'b',
      dueDate: '2026-01-01',
    }
    const result = validateBackup(backup({ cards: [escueto] }))
    expect(result.cards[0]).toMatchObject({ box: 1, reps: 0, lapses: 0, suspended: false })
    expect(result.cards[0].mediaIds).toEqual([])
  })

  it('conserva el icono del mazo', () => {
    const result = validateBackup(backup({ decks: [{ ...deck, emoji: '🧪' }] }))
    expect(result.decks[0].emoji).toBe('🧪')
  })

  it('un mazo sin icono se restaura sin icono', () => {
    expect(validateBackup(backup()).decks[0].emoji).toBe('')
  })

  it('recorta un icono que trae media frase detrás', () => {
    // Una copia editada a mano no va a meter un párrafo dentro de la ficha.
    const result = validateBackup(backup({ decks: [{ ...deck, emoji: '🧪 orgánica' }] }))
    expect(result.decks[0].emoji).toBe('🧪')
  })

  it('mete en rango una caja imposible', () => {
    const result = validateBackup(backup({ cards: [{ ...card, box: 47 }] }))
    expect(result.cards[0].box).toBe(5)
  })

  it('rechaza una calificación que no existe', () => {
    expect(() => validateBackup(backup({ reviewLogs: [{ ...log, grade: 'perfecto' }] }))).toThrow(
      /grade/,
    )
  })

  it('rechaza una imagen que no es un data URL', () => {
    const media = [{ id: 'm1', mime: 'image/webp', createdAt: 1, data: 'https://ejemplo.com/a.png' }]
    expect(() => validateBackup(backup({ media }))).toThrow(/formato que no se reconoce/i)
  })

  it('acepta una imagen en data URL', () => {
    const media = [{ id: 'm1', mime: 'image/webp', createdAt: 1, data: 'data:image/webp;base64,AA' }]
    expect(validateBackup(backup({ media })).media).toHaveLength(1)
  })
})

describe('summarizeBackup', () => {
  it('cuenta lo que trae la copia', () => {
    const summary = summarizeBackup(validateBackup(backup()))
    expect(summary).toMatchObject({ decks: 1, cards: 1, media: 0 })
    expect(summary.exportedAt?.getUTCFullYear()).toBe(2026)
  })

  it('aguanta una fecha ilegible', () => {
    const summary = summarizeBackup(validateBackup(backup({ exportedAt: 'cuando sea' })))
    expect(summary.exportedAt).toBeUndefined()
  })
})
