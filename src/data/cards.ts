import { today, type IsoDate } from '../lib/date'
import type { Card } from '../domain/types'
import { db, newId } from './db'

export interface CardInput {
  deckId: string
  front: string
  back: string
}

export async function createCard(input: CardInput): Promise<Card> {
  const now = Date.now()
  const card: Card = {
    id: newId(),
    deckId: input.deckId,
    front: input.front.trim(),
    back: input.back.trim(),
    mediaIds: [],
    // Una carta nueva nace en la caja 1 y vencida: entra en la siguiente sesión.
    box: 1,
    dueDate: today(),
    reps: 0,
    lapses: 0,
    suspended: false,
    createdAt: now,
    updatedAt: now,
  }
  await db.cards.add(card)
  return card
}

export async function updateCard(
  id: string,
  patch: Partial<Pick<Card, 'front' | 'back' | 'suspended'>>,
): Promise<void> {
  const changes: Partial<Card> = { updatedAt: Date.now() }
  if (patch.front !== undefined) changes.front = patch.front.trim()
  if (patch.back !== undefined) changes.back = patch.back.trim()
  if (patch.suspended !== undefined) changes.suspended = patch.suspended
  await db.cards.update(id, changes)
}

export async function deleteCard(id: string): Promise<void> {
  await db.transaction('rw', db.cards, db.reviewLogs, async () => {
    await db.reviewLogs.where('cardId').equals(id).delete()
    await db.cards.delete(id)
  })
}

export function listCards(deckId: string): Promise<Card[]> {
  return db.cards.where('deckId').equals(deckId).reverse().sortBy('createdAt')
}

export function getCard(id: string): Promise<Card | undefined> {
  return db.cards.get(id)
}

export function countCards(deckId: string): Promise<number> {
  return db.cards.where('deckId').equals(deckId).count()
}

/**
 * Cartas vencidas de un mazo: las que tocan hoy y las atrasadas.
 * Usa el índice compuesto [deckId+dueDate], así que no recorre el mazo entero.
 */
export async function listDueCards(
  deckId: string,
  reference: IsoDate = today(),
): Promise<Card[]> {
  const due = await db.cards
    .where('[deckId+dueDate]')
    .between([deckId, ''], [deckId, reference], true, true)
    .toArray()
  return due.filter((card) => !card.suspended)
}

export async function countDueCards(deckId: string, reference: IsoDate = today()): Promise<number> {
  return (await listDueCards(deckId, reference)).length
}

/** Todas las cartas vencidas, de todos los mazos, para la sesión conjunta. */
export async function listAllDueCards(reference: IsoDate = today()): Promise<Card[]> {
  const due = await db.cards.where('dueDate').belowOrEqual(reference).toArray()
  return due.filter((card) => !card.suspended)
}

/**
 * Primera fecha en la que vuelve a haber algo que repasar, para poder decir
 * «vuelve el martes» en vez de dejar una pantalla vacía sin explicación.
 * `undefined` si el mazo no tiene cartas.
 */
export async function nextDueDate(deckId?: string): Promise<IsoDate | undefined> {
  const cards = deckId
    ? await db.cards.where('deckId').equals(deckId).toArray()
    : await db.cards.toArray()

  const pending = cards.filter((card) => !card.suspended).map((card) => card.dueDate)
  return pending.length > 0 ? pending.reduce((a, b) => (a < b ? a : b)) : undefined
}
