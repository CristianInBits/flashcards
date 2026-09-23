import { describe, expect, it } from 'vitest'

import { normalizeTags, parseTags } from './decks'

describe('normalizeTags', () => {
  it('quita espacios y pasa a minúsculas', () => {
    expect(normalizeTags([' Álgebra ', 'EXAMEN'])).toEqual(['álgebra', 'examen'])
  })

  it('elimina repetidas aunque vengan escritas distinto', () => {
    expect(normalizeTags(['Historia', 'historia', ' HISTORIA'])).toEqual(['historia'])
  })

  it('descarta las vacías', () => {
    expect(normalizeTags(['', '   ', 'latín'])).toEqual(['latín'])
  })

  it('ordena respetando los acentos del español', () => {
    // Con el orden de código, la ñ iría detrás de la z.
    expect(normalizeTags(['zoología', 'ñ', 'anatomía'])).toEqual(['anatomía', 'ñ', 'zoología'])
  })
})

describe('parseTags', () => {
  it('separa por comas y limpia', () => {
    expect(parseTags('Primero, examen enero ,, PRIMERO')).toEqual(['examen enero', 'primero'])
  })

  it('devuelve una lista vacía si no hay nada', () => {
    expect(parseTags('   ')).toEqual([])
  })
})
