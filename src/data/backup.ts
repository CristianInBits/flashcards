import {
  BACKUP_FORMAT,
  BACKUP_VERSION,
  InvalidBackupError,
  validateBackup,
  type Backup,
  type BackupMedia,
} from '../domain/backup'
import { today } from '../lib/date'
import { db } from './db'

export async function exportBackup(): Promise<Blob> {
  const [decks, cards, reviewLogs, media] = await Promise.all([
    db.decks.toArray(),
    db.cards.toArray(),
    db.reviewLogs.toArray(),
    db.media.toArray(),
  ])

  const backup: Backup = {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    decks,
    cards,
    reviewLogs,
    media: await Promise.all(
      media.map(async (item): Promise<BackupMedia> => ({
        id: item.id,
        mime: item.mime,
        createdAt: item.createdAt,
        data: await blobToDataUrl(item.blob),
      })),
    ),
  }

  return new Blob([JSON.stringify(backup)], { type: 'application/json' })
}

export function backupFilename(): string {
  return `carti-${today()}.json`
}

export async function readBackupFile(file: File): Promise<Backup> {
  const text = await file.text()

  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new InvalidBackupError('El fichero no es un JSON válido.')
  }

  return validateBackup(parsed)
}

/**
 * Restaura **reemplazando** todo lo que hay en el dispositivo.
 *
 * No se fusiona a propósito: mezclar dos bases de datos con los mismos
 * identificadores acaba en cartas duplicadas o pisadas, y una copia de
 * seguridad es para volver a un estado conocido, no para juntar dos.
 *
 * Todo en una transacción: si algo falla a mitad, no te quedas sin lo que
 * tenías y sin lo que ibas a restaurar.
 */
export async function restoreBackup(backup: Backup): Promise<void> {
  const media = await Promise.all(
    backup.media.map(async (item) => ({
      id: item.id,
      mime: item.mime,
      createdAt: item.createdAt,
      blob: await dataUrlToBlob(item.data),
    })),
  )

  await db.transaction('rw', db.decks, db.cards, db.reviewLogs, db.media, async () => {
    await Promise.all([db.decks.clear(), db.cards.clear(), db.reviewLogs.clear(), db.media.clear()])
    await Promise.all([
      db.decks.bulkAdd(backup.decks),
      db.cards.bulkAdd(backup.cards),
      db.reviewLogs.bulkAdd(backup.reviewLogs),
      db.media.bulkAdd(media),
    ])
  })
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error ?? new Error('No se ha podido leer la imagen.'))
    reader.readAsDataURL(blob)
  })
}

async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  // fetch entiende los data: URL y hace la decodificación de base64 por nosotros.
  const response = await fetch(dataUrl)
  return response.blob()
}
