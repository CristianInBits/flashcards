import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router'

import { countCards, countDueCards } from '../../data/cards'
import { createDeck, listDecks, listTags, parseTags } from '../../data/decks'

export function DecksPage() {
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const tags = useLiveQuery(() => listTags(), [], [])
  const summaries = useLiveQuery(async () => {
    const decks = await listDecks()
    return Promise.all(
      decks.map(async (deck) => ({
        deck,
        total: await countCards(deck.id),
        due: await countDueCards(deck.id),
      })),
    )
  }, [])

  if (!summaries) {
    return (
      <section className="page">
        <h1 className="page__title">Mis mazos</h1>
        <p className="empty__hint">Cargando…</p>
      </section>
    )
  }

  const visible = activeTag
    ? summaries.filter((item) => item.deck.tags.includes(activeTag))
    : summaries

  return (
    <section className="page">
      <div className="page__head">
        <h1 className="page__title">Mis mazos</h1>
        <button type="button" className="button" onClick={() => setCreating(true)}>
          Nuevo mazo
        </button>
      </div>

      {creating && <NewDeckForm onClose={() => setCreating(false)} />}

      {tags.length > 0 && (
        <div className="chips" role="group" aria-label="Filtrar por etiqueta">
          <button
            type="button"
            className={activeTag === null ? 'chip is-active' : 'chip'}
            onClick={() => setActiveTag(null)}
          >
            Todas
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={activeTag === tag ? 'chip is-active' : 'chip'}
              onClick={() => setActiveTag(tag === activeTag ? null : tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {visible.length === 0 ? (
        <div className="empty">
          <p className="empty__text">
            {summaries.length === 0 ? 'Todavía no hay ningún mazo.' : 'Ningún mazo con esa etiqueta.'}
          </p>
          {summaries.length === 0 && (
            <p className="empty__hint">Crea uno y empieza a meterle cartas.</p>
          )}
        </div>
      ) : (
        <ul className="list">
          {visible.map(({ deck, total, due }) => (
            <li key={deck.id}>
              <Link className="card-item" to={`/mazo/${deck.id}`}>
                <div className="card-item__body">
                  <span className="card-item__title">{deck.name}</span>
                  {deck.description && (
                    <span className="card-item__subtitle">{deck.description}</span>
                  )}
                  {deck.tags.length > 0 && (
                    <span className="card-item__tags">{deck.tags.join(' · ')}</span>
                  )}
                </div>
                <div className="counts">
                  <span className={due > 0 ? 'count count--due' : 'count'}>{due}</span>
                  <span className="count__label">de {total}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function NewDeckForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [saving, setSaving] = useState(false)

  const canSave = name.trim().length > 0 && !saving

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!canSave) return
    setSaving(true)
    await createDeck({ name, description, tags: parseTags(tags) })
    onClose()
  }

  return (
    <form className="form" onSubmit={(event) => void handleSubmit(event)}>
      <label className="field">
        <span className="field__label">Nombre</span>
        <input
          className="input"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Anatomía, Alemán A2, Estructuras de datos…"
          autoFocus
        />
      </label>

      <label className="field">
        <span className="field__label">Descripción (opcional)</span>
        <input
          className="input"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </label>

      <label className="field">
        <span className="field__label">Etiquetas (opcional, separadas por comas)</span>
        <input
          className="input"
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          placeholder="primero, examen enero"
        />
      </label>

      <div className="form__actions">
        <button type="submit" className="button" disabled={!canSave}>
          Crear
        </button>
        <button type="button" className="button button--ghost" onClick={onClose}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
