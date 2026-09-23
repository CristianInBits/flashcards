import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Link, useNavigate, useParams } from 'react-router'

import { deleteCard, listCards } from '../../data/cards'
import { deleteDeck, getDeck, parseTags, updateDeck } from '../../data/decks'
import type { Deck } from '../../domain/types'
import { isDue } from '../../lib/date'
import { toPlainText } from '../../lib/plainText'

export function DeckPage() {
  const { deckId = '' } = useParams()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)

  // useLiveQuery devuelve undefined mientras carga, así que el «no existe» se
  // marca con null explícito: si no, un mazo borrado se quedaría cargando para siempre.
  const deck = useLiveQuery(async () => (await getDeck(deckId)) ?? null, [deckId])
  const cards = useLiveQuery(() => listCards(deckId), [deckId])

  if (deck === undefined || cards === undefined) {
    return (
      <section className="page">
        <p className="empty__hint">Cargando…</p>
      </section>
    )
  }

  if (deck === null) {
    return (
      <section className="page">
        <div className="empty">
          <p className="empty__text">Este mazo ya no existe.</p>
          <Link className="button" to="/">
            Volver a mis mazos
          </Link>
        </div>
      </section>
    )
  }

  async function handleDelete(target: Deck) {
    const message =
      cards && cards.length > 0
        ? `¿Borrar «${target.name}» y sus ${cards.length} cartas? No se puede deshacer.`
        : `¿Borrar «${target.name}»?`
    if (!window.confirm(message)) return
    await deleteDeck(target.id)
    void navigate('/')
  }

  return (
    <section className="page">
      <Link className="back" to="/">
        ← Mis mazos
      </Link>

      <div className="page__head">
        <h1 className="page__title">{deck.name}</h1>
        <Link className="button" to={`/mazo/${deck.id}/carta/nueva`}>
          Añadir carta
        </Link>
      </div>

      {deck.description && <p className="page__subtitle">{deck.description}</p>}
      {deck.tags.length > 0 && <p className="card-item__tags">{deck.tags.join(' · ')}</p>}

      <div className="form__actions">
        <button type="button" className="button button--ghost" onClick={() => setEditing(true)}>
          Editar mazo
        </button>
        <button
          type="button"
          className="button button--danger"
          onClick={() => void handleDelete(deck)}
        >
          Borrar mazo
        </button>
      </div>

      {editing && <EditDeckForm deck={deck} onClose={() => setEditing(false)} />}

      {cards.length === 0 ? (
        <div className="empty">
          <p className="empty__text">Este mazo está vacío.</p>
          <p className="empty__hint">Las cartas admiten Markdown, fórmulas LaTeX y código.</p>
        </div>
      ) : (
        <ul className="list">
          {cards.map((card) => (
            <li key={card.id}>
              <div className="card-item">
                <Link className="card-item__body" to={`/mazo/${deck.id}/carta/${card.id}`}>
                  {/* En la lista va el texto plano: renderizar el Markdown de cada
                      fila obligaría a cargar KaTeX para ver un listado. */}
                  <span className="card-item__title">{toPlainText(card.front)}</span>
                  <span className="card-item__subtitle">{toPlainText(card.back)}</span>
                </Link>
                <div className="card-item__aside">
                  <span className={isDue(card.dueDate) ? 'pill pill--due' : 'pill'}>
                    Caja {card.box}
                  </span>
                  <button
                    type="button"
                    className="icon-button"
                    aria-label={`Borrar la carta «${card.front.slice(0, 40)}»`}
                    onClick={() => {
                      if (window.confirm('¿Borrar esta carta?')) void deleteCard(card.id)
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function EditDeckForm({ deck, onClose }: { deck: Deck; onClose: () => void }) {
  const [name, setName] = useState(deck.name)
  const [description, setDescription] = useState(deck.description)
  const [tags, setTags] = useState(deck.tags.join(', '))

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (name.trim().length === 0) return
    await updateDeck(deck.id, { name, description, tags: parseTags(tags) })
    onClose()
  }

  return (
    <form className="form" onSubmit={(event) => void handleSubmit(event)}>
      <label className="field">
        <span className="field__label">Nombre</span>
        <input className="input" value={name} onChange={(event) => setName(event.target.value)} />
      </label>

      <label className="field">
        <span className="field__label">Descripción</span>
        <input
          className="input"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </label>

      <label className="field">
        <span className="field__label">Etiquetas (separadas por comas)</span>
        <input className="input" value={tags} onChange={(event) => setTags(event.target.value)} />
      </label>

      <div className="form__actions">
        <button type="submit" className="button" disabled={name.trim().length === 0}>
          Guardar
        </button>
        <button type="button" className="button button--ghost" onClick={onClose}>
          Cancelar
        </button>
      </div>
    </form>
  )
}
