import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

import { backupFilename, exportBackup, readBackupFile, restoreBackup } from '../../data/backup'
import { mediaSize } from '../../data/media'
import { summarizeBackup, type Backup } from '../../domain/backup'
import { formatBytes } from '../../lib/image'
import { readTheme, saveTheme, type Theme } from '../../lib/theme'

const STANDALONE_QUERY = '(display-mode: standalone)'

function subscribeToDisplayMode(onChange: () => void) {
  const query = window.matchMedia(STANDALONE_QUERY)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

/** Si la app corre instalada en la pantalla de inicio en vez de en una pestaña. */
function useStandalone() {
  return useSyncExternalStore(
    subscribeToDisplayMode,
    () => window.matchMedia(STANDALONE_QUERY).matches,
    () => false,
  )
}

export function SettingsPage() {
  const standalone = useStandalone()
  const [persisted, setPersisted] = useState<boolean | null>(null)
  const [images, setImages] = useState<number>()

  useEffect(() => {
    let cancelled = false
    if (navigator.storage?.persisted) {
      void navigator.storage.persisted().then((value) => {
        if (!cancelled) setPersisted(value)
      })
    }
    void mediaSize().then((size) => {
      if (!cancelled) setImages(size)
    })
    return () => {
      cancelled = true
    }
  }, [])

  async function requestPersistence() {
    if (!navigator.storage?.persist) return
    setPersisted(await navigator.storage.persist())
  }

  return (
    <section className="page">
      <h1 className="page__title">Ajustes</h1>

      <ThemePicker />

      <dl className="rows">
        <div className="row">
          <dt className="row__label">Versión</dt>
          <dd className="row__value">{__APP_VERSION__}</dd>
        </div>
        <div className="row">
          <dt className="row__label">Modo</dt>
          <dd className="row__value">{standalone ? 'Instalada' : 'En el navegador'}</dd>
        </div>
        <div className="row">
          <dt className="row__label">Almacenamiento</dt>
          <dd className="row__value">
            {persisted === null ? 'Sin determinar' : persisted ? 'Persistente' : 'Sin garantizar'}
          </dd>
        </div>
        {images !== undefined && images > 0 && (
          <div className="row">
            <dt className="row__label">Imágenes</dt>
            <dd className="row__value">{formatBytes(images)}</dd>
          </div>
        )}
      </dl>

      {persisted === false && (
        <div className="notice">
          <p className="notice__text">
            El navegador puede borrar los datos de Carti si le hace falta espacio, o si pasas
            semanas sin abrirla.
          </p>
          <button type="button" className="button" onClick={() => void requestPersistence()}>
            Pedir almacenamiento permanente
          </button>
        </div>
      )}

      <BackupSection />
    </section>
  )
}

const THEMES: { value: Theme; label: string }[] = [
  { value: 'system', label: 'Sistema' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
]

function ThemePicker() {
  const [theme, setTheme] = useState<Theme>(() => readTheme())

  function choose(next: Theme) {
    setTheme(next)
    saveTheme(next)
  }

  return (
    <div className="field">
      <span className="field__label">Tema</span>
      <div className="chips" role="group" aria-label="Tema">
        {THEMES.map((option) => (
          <button
            key={option.value}
            type="button"
            className={theme === option.value ? 'chip is-active' : 'chip'}
            aria-pressed={theme === option.value}
            onClick={() => choose(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  )
}

type Status = { kind: 'idle' } | { kind: 'working' } | { kind: 'error'; message: string }

function BackupSection() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [pending, setPending] = useState<Backup>()

  async function handleExport() {
    setStatus({ kind: 'working' })
    try {
      const blob = await exportBackup()
      const filename = backupFilename()
      const file = new File([blob], filename, { type: 'application/json' })

      // En el móvil compartir es lo que funciona: en iOS una descarga directa
      // desde una app instalada no lleva a ninguna parte.
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Copia de seguridad de Carti' })
      } else {
        download(blob, filename)
      }
      setStatus({ kind: 'idle' })
    } catch (error) {
      // Cancelar el diálogo de compartir no es un fallo que haya que enseñar.
      if (error instanceof DOMException && error.name === 'AbortError') {
        setStatus({ kind: 'idle' })
        return
      }
      setStatus({ kind: 'error', message: messageOf(error) })
    }
  }

  async function handleFile(file: File) {
    setStatus({ kind: 'working' })
    try {
      setPending(await readBackupFile(file))
      setStatus({ kind: 'idle' })
    } catch (error) {
      setPending(undefined)
      setStatus({ kind: 'error', message: messageOf(error) })
    }
  }

  async function confirmRestore() {
    if (!pending) return
    setStatus({ kind: 'working' })
    try {
      await restoreBackup(pending)
      setPending(undefined)
      // Recarga para que no quede nada en memoria de los datos anteriores.
      window.location.href = import.meta.env.BASE_URL
    } catch (error) {
      setStatus({ kind: 'error', message: messageOf(error) })
    }
  }

  const summary = pending && summarizeBackup(pending)

  return (
    <>
      <h2 className="page__title page__title--small">Copia de seguridad</h2>
      <p className="empty__hint">
        Los datos solo están en este dispositivo. Si lo pierdes o reinstalas el navegador, se van
        con él.
      </p>

      <div className="form__actions">
        <button
          type="button"
          className="button"
          disabled={status.kind === 'working'}
          onClick={() => void handleExport()}
        >
          Guardar una copia
        </button>
        <button
          type="button"
          className="button button--ghost"
          disabled={status.kind === 'working'}
          onClick={() => fileRef.current?.click()}
        >
          Restaurar
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) void handleFile(file)
            event.target.value = ''
          }}
        />
      </div>

      {status.kind === 'error' && (
        <div className="notice notice--error">
          <p className="notice__text">{status.message}</p>
        </div>
      )}

      {summary && (
        <div className="notice notice--warning">
          <p className="notice__text">
            La copia tiene <strong>{summary.decks}</strong>{' '}
            {summary.decks === 1 ? 'mazo' : 'mazos'}, <strong>{summary.cards}</strong>{' '}
            {summary.cards === 1 ? 'carta' : 'cartas'} y <strong>{summary.media}</strong>{' '}
            {summary.media === 1 ? 'imagen' : 'imágenes'}
            {summary.exportedAt &&
              `, del ${new Intl.DateTimeFormat('es-ES', {
                dateStyle: 'long',
                timeStyle: 'short',
              }).format(summary.exportedAt)}`}
            .
          </p>
          <p className="notice__text">
            Restaurar <strong>reemplaza todo</strong> lo que tienes ahora en este dispositivo,
            incluido el progreso de repaso. No se puede deshacer.
          </p>
          <div className="form__actions">
            <button
              type="button"
              className="button button--danger"
              disabled={status.kind === 'working'}
              onClick={() => void confirmRestore()}
            >
              Reemplazar mis datos
            </button>
            <button
              type="button"
              className="button button--ghost"
              onClick={() => setPending(undefined)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  )
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  // Revocar en el mismo tick cancela la descarga en algunos navegadores.
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : 'Ha fallado algo inesperado.'
}
