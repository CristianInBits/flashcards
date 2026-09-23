import { useRegisterSW } from 'virtual:pwa-register/react'

/**
 * La app se precachea entera, así que una versión nueva no se aplica sola:
 * el service worker la descarga y espera. Esto avisa y deja recargar.
 */
export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div className="toast" role="status">
      <span>Hay una versión nueva de Carti.</span>
      <div className="toast__actions">
        <button type="button" className="button" onClick={() => void updateServiceWorker(true)}>
          Actualizar
        </button>
        <button type="button" className="button button--ghost" onClick={() => setNeedRefresh(false)}>
          Ahora no
        </button>
      </div>
    </div>
  )
}
