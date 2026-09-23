import type { Deck } from '../domain/types'
import { db, newId } from './db'

export interface DeckInput {
  name: string
  description?: string
  tags?: string[]
}

export async function createDeck(input: DeckInput): Promise<Deck> {
  const now = Date.now()
  const deck: Deck = {
    id: newId(),
    name: input.name.trim(),
    description: input.description?.trim() ?? '',
    tags: normalizeTags(input.tags ?? []),
    createdAt: now,
    updatedAt: now,
  }
  await db.decks.add(deck)
  return deck
}

export async function updateDeck(id: string, patch: Partial<DeckInput>): Promise<void> {
  const changes: Partial<Deck> = { updatedAt: Date.now() }
  if (patch.name !== undefined) changes.name = patch.name.trim()
  if (patch.description !== undefined) changes.description = patch.description.trim()
  if (patch.tags !== undefined) changes.tags = normalizeTags(patch.tags)
  await db.decks.update(id, changes)
}

/** Borra el mazo y todo lo que cuelga de él. En una transacción: o se va todo o no se va nada. */
export async function deleteDeck(id: string): Promise<void> {
  await db.transaction('rw', db.decks, db.cards, db.reviewLogs, async () => {
    await db.cards.where('deckId').equals(id).delete()
    await db.reviewLogs.where('deckId').equals(id).delete()
    await db.decks.delete(id)
  })
}

export function listDecks(): Promise<Deck[]> {
  return db.decks.orderBy('name').toArray()
}

export function getDeck(id: string): Promise<Deck | undefined> {
  return db.decks.get(id)
}

/** Todas las etiquetas en uso, ordenadas, sin repetir. */
export async function listTags(): Promise<string[]> {
  const decks = await db.decks.toArray()
  const tags = new Set(decks.flatMap((deck) => deck.tags))
  return [...tags].sort((a, b) => a.localeCompare(b, 'es'))
}

/** Minúsculas, sin espacios sobrantes y sin repetidas: «Álgebra» y «álgebra » son la misma. */
export function normalizeTags(tags: string[]): string[] {
  const cleaned = tags.map((tag) => tag.trim().toLowerCase()).filter((tag) => tag.length > 0)
  return [...new Set(cleaned)].sort((a, b) => a.localeCompare(b, 'es'))
}

export function parseTags(input: string): string[] {
  return normalizeTags(input.split(','))
}
