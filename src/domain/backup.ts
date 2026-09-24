import type { Card, Deck, ReviewLog } from './types'

/**
 * Formato de la copia de seguridad y su validación.
 *
 * Restaurar **reemplaza** todo lo que hay en el dispositivo, así que un fichero
 * a medias o de otra aplicación no puede colarse: antes de tocar nada se
 * comprueba que tiene la pinta correcta y, si no, se explica por qué no vale.
 */
export const BACKUP_FORMAT = 'carti-backup'
export const BACKUP_VERSION = 1

export interface BackupMedia {
  id: string
  mime: string
  createdAt: number
  /** La imagen como data URL, que es lo único que cabe en un JSON. */
  data: string
}

export interface Backup {
  format: typeof BACKUP_FORMAT
  version: number
  exportedAt: string
  decks: Deck[]
  cards: Card[]
  reviewLogs: ReviewLog[]
  media: BackupMedia[]
}

export interface BackupSummary {
  decks: number
  cards: number
  media: number
  exportedAt?: Date
}

export class InvalidBackupError extends Error {}

export function summarizeBackup(backup: Backup): BackupSummary {
  const exportedAt = new Date(backup.exportedAt)
  return {
    decks: backup.decks.length,
    cards: backup.cards.length,
    media: backup.media.length,
    exportedAt: Number.isNaN(exportedAt.getTime()) ? undefined : exportedAt,
  }
}

/**
 * Comprueba que lo que se ha leído del fichero es una copia de Carti.
 * Lanza `InvalidBackupError` con un mensaje que se le puede enseñar al usuario.
 */
export function validateBackup(data: unknown): Backup {
  if (!isRecord(data)) {
    throw new InvalidBackupError('El fichero no contiene un objeto JSON.')
  }

  if (data.format !== BACKUP_FORMAT) {
    throw new InvalidBackupError('Esto no parece una copia de seguridad de Carti.')
  }

  if (typeof data.version !== 'number' || !Number.isInteger(data.version)) {
    throw new InvalidBackupError('La copia no indica su versión.')
  }

  if (data.version > BACKUP_VERSION) {
    throw new InvalidBackupError(
      `La copia es de una versión más nueva de Carti (${data.version}). Actualiza la aplicación antes de restaurarla.`,
    )
  }

  const decks = requireArray(data.decks, 'mazos').map(readDeck)
  const cards = requireArray(data.cards, 'cartas').map(readCard)
  const reviewLogs = requireArray(data.reviewLogs, 'repasos').map(readReviewLog)
  const media = requireArray(data.media, 'imágenes').map(readMedia)

  // Una carta cuyo mazo no está en el fichero quedaría invisible para siempre.
  const deckIds = new Set(decks.map((deck) => deck.id))
  const huérfanas = cards.filter((card) => !deckIds.has(card.deckId))
  if (huérfanas.length > 0) {
    throw new InvalidBackupError(
      `La copia tiene ${huérfanas.length} carta(s) que apuntan a un mazo que no está en el fichero.`,
    )
  }

  return {
    format: BACKUP_FORMAT,
    version: data.version,
    exportedAt: typeof data.exportedAt === 'string' ? data.exportedAt : '',
    decks,
    cards,
    reviewLogs,
    media,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function requireArray(value: unknown, label: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new InvalidBackupError(`A la copia le falta la lista de ${label}.`)
  }
  return value
}

function field<T>(source: Record<string, unknown>, key: string, check: (v: unknown) => v is T): T {
  const value = source[key]
  if (!check(value)) {
    throw new InvalidBackupError(`La copia está corrupta: falta o es inválido el campo «${key}».`)
  }
  return value
}

const isString = (v: unknown): v is string => typeof v === 'string'
const isNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every(isString)

function readDeck(raw: unknown): Deck {
  if (!isRecord(raw)) throw new InvalidBackupError('Hay un mazo que no es un objeto.')
  return {
    id: field(raw, 'id', isString),
    name: field(raw, 'name', isString),
    description: isString(raw.description) ? raw.description : '',
    tags: isStringArray(raw.tags) ? raw.tags : [],
    createdAt: isNumber(raw.createdAt) ? raw.createdAt : Date.now(),
    updatedAt: isNumber(raw.updatedAt) ? raw.updatedAt : Date.now(),
  }
}

function readCard(raw: unknown): Card {
  if (!isRecord(raw)) throw new InvalidBackupError('Hay una carta que no es un objeto.')

  const box = isNumber(raw.box) ? Math.min(Math.max(Math.round(raw.box), 1), 5) : 1
  return {
    id: field(raw, 'id', isString),
    deckId: field(raw, 'deckId', isString),
    front: field(raw, 'front', isString),
    back: field(raw, 'back', isString),
    mediaIds: isStringArray(raw.mediaIds) ? raw.mediaIds : [],
    box: box as Card['box'],
    dueDate: field(raw, 'dueDate', isString),
    reps: isNumber(raw.reps) ? raw.reps : 0,
    lapses: isNumber(raw.lapses) ? raw.lapses : 0,
    lastReviewedAt: isNumber(raw.lastReviewedAt) ? raw.lastReviewedAt : undefined,
    suspended: raw.suspended === true,
    createdAt: isNumber(raw.createdAt) ? raw.createdAt : Date.now(),
    updatedAt: isNumber(raw.updatedAt) ? raw.updatedAt : Date.now(),
  }
}

function readReviewLog(raw: unknown): ReviewLog {
  if (!isRecord(raw)) throw new InvalidBackupError('Hay un repaso que no es un objeto.')
  return {
    id: field(raw, 'id', isString),
    cardId: field(raw, 'cardId', isString),
    deckId: field(raw, 'deckId', isString),
    reviewedAt: field(raw, 'reviewedAt', isNumber),
    grade: field(raw, 'grade', (v): v is ReviewLog['grade'] =>
      v === 'again' || v === 'good' || v === 'easy',
    ),
    boxBefore: field(raw, 'boxBefore', isNumber) as ReviewLog['boxBefore'],
    boxAfter: field(raw, 'boxAfter', isNumber) as ReviewLog['boxAfter'],
  }
}

function readMedia(raw: unknown): BackupMedia {
  if (!isRecord(raw)) throw new InvalidBackupError('Hay una imagen que no es un objeto.')
  const data = field(raw, 'data', isString)
  if (!data.startsWith('data:')) {
    throw new InvalidBackupError('Hay una imagen guardada en un formato que no se reconoce.')
  }
  return {
    id: field(raw, 'id', isString),
    mime: isString(raw.mime) ? raw.mime : 'application/octet-stream',
    createdAt: isNumber(raw.createdAt) ? raw.createdAt : Date.now(),
    data,
  }
}
