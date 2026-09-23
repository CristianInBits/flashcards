import { useEffect, useState, useSyncExternalStore } from 'react'

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

/**
 * Si el navegador garantiza que no va a purgar los datos.
 * `null` significa que el navegador no sabe responder a la pregunta.
 */
function usePersistentStorage() {
  const [persisted, setPersisted] = useState<boolean | null>(null)

  useEffect(() => {
    if (!navigator.storage?.persisted) return
    let cancelled = false
    void navigator.storage.persisted().then((value) => {
      if (!cancelled) setPersisted(value)
    })
    return () => {
      cancelled = true
    }
  }, [])

  return persisted
}

export function SettingsPage() {
  const standalone = useStandalone()
  const persisted = usePersistentStorage()

  return (
    <section className="page">
      <h1 className="page__title">Ajustes</h1>

      <dl className="rows">
        <div className="row">
          <dt className="row__label">Versión</dt>
          <dd className="row__value">{__APP_VERSION__} · fase 0</dd>
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
      </dl>

      <p className="empty__hint">
        El tema, la copia de seguridad y la clave de la API llegan en fases posteriores.
      </p>
    </section>
  )
}
