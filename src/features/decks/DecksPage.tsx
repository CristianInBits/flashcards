export function DecksPage() {
  return (
    <section className="page">
      <h1 className="page__title">Mis mazos</h1>

      <div className="empty">
        <p className="empty__text">Todavía no hay ningún mazo.</p>
        <p className="empty__hint">
          Crear mazos y cartas llega en la fase 1. De momento esto solo comprueba que la
          aplicación se instala y abre sin conexión.
        </p>
      </div>
    </section>
  )
}
