import { describe, expect, it } from 'vitest'

import { matchesSearch, summarizeDecks } from './decks'
import type { Card, Deck } from './types'

function deck(overrides: Partial<Deck> = {}): Deck {
  return {
    id: 'd1',
    name: 'Álgebra',
    description: 'Primero de carrera',
    tags: ['examen enero'],
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
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

const HOY = '2026-05-20'

describe('summarizeDecks', () => {
  it('cuenta cartas, vencidas y dominadas', () => {
    const cards = [
      card({ box: 1, dueDate: '2026-05-20' }),
      card({ box: 2, dueDate: '2026-05-19' }),
      card({ box: 4, dueDate: '2026-06-01' }),
      card({ box: 5, dueDate: '2026-06-10' }),
    ]
    const [resumen] = summarizeDecks([deck()], cards, HOY)
    expect(resumen).toMatchObject({ total: 4, due: 2, mastered: 2 })
  })

  it('la caja 3 todavía no es dominada, la 4 sí', () => {
    const [resumen] = summarizeDecks([deck()], [card({ box: 3 }), card({ box: 4 })], HOY)
    expect(resumen.mastered).toBe(1)
  })

  it('las suspendidas no cuentan para nada', () => {
    const cards = [card(), card({ suspended: true, box: 5, dueDate: '2026-05-01' })]
    const [resumen] = summarizeDecks([deck()], cards, HOY)
    expect(resumen).toMatchObject({ total: 1, due: 1, mastered: 0 })
  })

  it('un mazo sin cartas sale a cero, no se omite', () => {
    const [resumen] = summarizeDecks([deck()], [], HOY)
    expect(resumen).toMatchObject({ total: 0, due: 0, mastered: 0 })
  })

  it('reparte las cartas por su mazo', () => {
    const decks = [deck({ id: 'd1' }), deck({ id: 'd2', name: 'Historia' })]
    const cards = [card({ deckId: 'd1' }), card({ deckId: 'd2' }), card({ deckId: 'd2' })]
    expect(summarizeDecks(decks, cards, HOY).map((r) => r.total)).toEqual([1, 2])
  })

  it('ignora cartas cuyo mazo ya no existe', () => {
    const resumen = summarizeDecks([deck({ id: 'd1' })], [card({ deckId: 'fantasma' })], HOY)
    expect(resumen[0].total).toBe(0)
  })

  it('mantiene el orden de los mazos que recibe', () => {
    const decks = [deck({ id: 'b', name: 'B' }), deck({ id: 'a', name: 'A' })]
    expect(summarizeDecks(decks, [], HOY).map((r) => r.deck.name)).toEqual(['B', 'A'])
  })
})

describe('matchesSearch', () => {
  it('sin búsqueda pasan todos', () => {
    expect(matchesSearch(deck(), '')).toBe(true)
    expect(matchesSearch(deck(), '   ')).toBe(true)
  })

  it('busca en el nombre sin importar los acentos', () => {
    expect(matchesSearch(deck(), 'algebra')).toBe(true)
    expect(matchesSearch(deck(), 'ÁLGEBRA')).toBe(true)
  })

  it('busca en la descripción y en las etiquetas', () => {
    expect(matchesSearch(deck(), 'carrera')).toBe(true)
    expect(matchesSearch(deck(), 'enero')).toBe(true)
  })

  it('todas las palabras tienen que aparecer, aunque sea en campos distintos', () => {
    expect(matchesSearch(deck(), 'alg enero')).toBe(true)
    expect(matchesSearch(deck(), 'alg diciembre')).toBe(false)
  })

  it('no encuentra lo que no está', () => {
    expect(matchesSearch(deck(), 'historia')).toBe(false)
  })
})
