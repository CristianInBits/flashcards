import { isDue, today, type IsoDate } from '../lib/date'
import type { Card, Deck } from './types'

/**
 * Resumen de un mazo para la lista.
 *
 * `mastered` son las cartas que ya están en las cajas 4 y 5, las que vuelven
 * cada 8 o 16 días. No es «completadas» —en repetición espaciada nada se
 * completa— sino «te las sabes lo bastante como para no verlas casi nunca».
 */
export const MASTERED_BOX = 4

export interface DeckSummary {
  deck: Deck
  total: number
  due: number
  mastered: number
}

export function summarizeDecks(
  decks: readonly Deck[],
  cards: readonly Card[],
  reference: IsoDate = today(),
): DeckSummary[] {
  const porMazo = new Map<string, { total: number; due: number; mastered: number }>()
  for (const deck of decks) porMazo.set(deck.id, { total: 0, due: 0, mastered: 0 })

  for (const card of cards) {
    if (card.suspended) continue
    const entrada = porMazo.get(card.deckId)
    // Una carta cuyo mazo ya no existe no cuenta para nadie.
    if (!entrada) continue

    entrada.total += 1
    if (isDue(card.dueDate, reference)) entrada.due += 1
    if (card.box >= MASTERED_BOX) entrada.mastered += 1
  }

  return decks.map((deck) => ({ deck, ...porMazo.get(deck.id)! }))
}

/** Filtra por texto libre sobre el nombre, la descripción y las etiquetas. */
export function matchesSearch(deck: Deck, query: string): boolean {
  const limpio = query.trim().toLowerCase()
  if (limpio.length === 0) return true

  // Cada palabra por separado: «alg exam» encuentra «Álgebra» con etiqueta «examen».
  return limpio.split(/\s+/).every((palabra) => {
    const aguja = quitarAcentos(palabra)
    return (
      quitarAcentos(deck.name).includes(aguja) ||
      quitarAcentos(deck.description).includes(aguja) ||
      deck.tags.some((tag) => quitarAcentos(tag).includes(aguja))
    )
  })
}

/** Para que «algebra» encuentre «Álgebra»: nadie escribe los acentos al buscar. */
function quitarAcentos(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}
