import type { IsoDate } from '../lib/date'

/** Calificación que se da a una carta al repasarla. */
export type Grade = 'again' | 'good' | 'easy'

/** Caja de Leitner. La 1 es la de las cartas que no te sabes. */
export type Box = 1 | 2 | 3 | 4 | 5

export interface Deck {
  id: string
  name: string
  /** Icono de la ficha. Vacío o ausente: se usan las iniciales del nombre. */
  emoji?: string
  description: string
  tags: string[]
  createdAt: number
  updatedAt: number
}

export interface Card {
  id: string
  deckId: string
  /** Anverso: la pregunta. Markdown. */
  front: string
  /** Reverso: la respuesta. Markdown. */
  back: string
  /** Imágenes referenciadas desde el markdown, para poder borrarlas con la carta. */
  mediaIds: string[]
  box: Box
  dueDate: IsoDate
  /** Repasos totales. */
  reps: number
  /** Veces que ha caído a la caja 1 después de haber subido. */
  lapses: number
  lastReviewedAt?: number
  suspended: boolean
  createdAt: number
  updatedAt: number
}

/** Un repaso. Se escribe una vez y no se edita nunca: es la materia prima de las estadísticas. */
export interface ReviewLog {
  id: string
  cardId: string
  deckId: string
  reviewedAt: number
  grade: Grade
  boxBefore: Box
  boxAfter: Box
}

export interface MediaItem {
  id: string
  blob: Blob
  mime: string
  createdAt: number
}
