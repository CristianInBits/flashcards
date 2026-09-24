import { describe, expect, it } from 'vitest'

import { answer, currentCard, isFinished, shuffleWith, startSession } from './session'
import type { Card } from './types'

function card(id: string): Card {
  return {
    id,
    deckId: 'd1',
    front: id,
    back: id,
    mediaIds: [],
    box: 1,
    dueDate: '2026-05-20',
    reps: 0,
    lapses: 0,
    suspended: false,
    createdAt: 0,
    updatedAt: 0,
  }
}

/** Sin barajar, para que el orden sea predecible en los tests. */
const noShuffle = <T,>(items: readonly T[]): T[] => [...items]

const ids = (session: { queue: readonly Card[] }) => session.queue.map((c) => c.id)

describe('startSession', () => {
  it('mete todas las cartas en la cola', () => {
    const session = startSession([card('a'), card('b'), card('c')], noShuffle)
    expect(ids(session)).toEqual(['a', 'b', 'c'])
    expect(session.total).toBe(3)
    expect(session.completed).toBe(0)
  })

  it('una sesión sin cartas está terminada desde el principio', () => {
    const session = startSession([], noShuffle)
    expect(isFinished(session)).toBe(true)
    expect(currentCard(session)).toBeUndefined()
  })

  it('baraja sin perder ni duplicar cartas', () => {
    const cards = ['a', 'b', 'c', 'd', 'e', 'f'].map(card)
    // Secuencia fija: el resultado es determinista pero distinto del original.
    let seed = 0
    const session = startSession(cards, shuffleWith(() => ((seed = (seed * 9301 + 49297) % 233280) / 233280)))
    expect(ids(session).sort()).toEqual(['a', 'b', 'c', 'd', 'e', 'f'])
  })
})

describe('answer', () => {
  it('Bien saca la carta de la cola y suma una completada', () => {
    const session = startSession([card('a'), card('b')], noShuffle)
    const next = answer(session, card('a'), 'good')

    expect(ids(next)).toEqual(['b'])
    expect(next.completed).toBe(1)
    expect(next.reviews).toBe(1)
    expect(next.failed).toBe(0)
  })

  it('Fácil también la saca', () => {
    const session = startSession([card('a'), card('b')], noShuffle)
    expect(ids(answer(session, card('a'), 'easy'))).toEqual(['b'])
  })

  it('Mal devuelve la carta al final de la cola', () => {
    const session = startSession([card('a'), card('b'), card('c')], noShuffle)
    const next = answer(session, card('a'), 'again')

    expect(ids(next)).toEqual(['b', 'c', 'a'])
    expect(next.completed).toBe(0)
    expect(next.failed).toBe(1)
    expect(next.reviews).toBe(1)
  })

  it('el total no cambia aunque una carta se repita', () => {
    let session = startSession([card('a'), card('b')], noShuffle)
    session = answer(session, card('a'), 'again')
    session = answer(session, card('b'), 'good')
    session = answer(session, card('a'), 'good')

    expect(session.total).toBe(2)
    expect(session.completed).toBe(2)
    expect(session.reviews).toBe(3)
    expect(isFinished(session)).toBe(true)
  })

  it('una carta fallada varias veces sigue volviendo', () => {
    let session = startSession([card('a')], noShuffle)
    session = answer(session, card('a'), 'again')
    expect(isFinished(session)).toBe(false)
    session = answer(session, card('a'), 'again')
    expect(isFinished(session)).toBe(false)
    expect(session.failed).toBe(2)

    session = answer(session, card('a'), 'good')
    expect(isFinished(session)).toBe(true)
    expect(session.completed).toBe(1)
  })

  it('guarda la carta ya calificada, no la original', () => {
    const session = startSession([card('a'), card('b')], noShuffle)
    const graded = { ...card('a'), box: 1 as const, reps: 1 }
    const next = answer(session, graded, 'again')

    expect(next.queue.at(-1)?.reps).toBe(1)
  })

  it('no muta la sesión anterior', () => {
    const session = startSession([card('a'), card('b')], noShuffle)
    answer(session, card('a'), 'good')

    expect(ids(session)).toEqual(['a', 'b'])
    expect(session.completed).toBe(0)
  })
})
