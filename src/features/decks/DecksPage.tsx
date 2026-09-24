import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router'

import { createDeck, listDeckSummaries, listTags, parseTags } from '../../data/decks'
import { matchesSearch, type DeckSummary } from '../../domain/decks'
import { deckColor, deckInitials } from '../../lib/deckColor'
import { EmojiPicker } from '../../ui/EmojiPicker'

/** Filtros de estado. Solo los que significan algo con repetición espaciada:
 *  no hay «completados» porque una carta de la caja 5 vuelve cada 16 días. */
type Filter = 'todos' | 'pendientes'

export function DecksPage() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('todos')
  const [tag, setTag] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  const tags = useLiveQuery(() => listTags(), [], [])
  const summaries = useLiveQuery(() => listDeckSummaries(), [])

  const visible = useMemo(() => {
    if (!summaries) return []
    return summaries.filter(({ deck, due }) => {
      if (filter === 'pendientes' && due === 0) return false
      if (tag && !deck.tags.includes(tag)) return false
      return matchesSearch(deck, search)
    })
  }, [summaries, filter, tag, search])

  if (!summaries) {
    return (
      <section className="page">
        <h1 className="page__title">Tus mazos</h1>
        <p className="empty__hint">Cargando…</p>
      </section>
    )
  }

  const totalDue = summaries.reduce((suma, item) => suma + item.due, 0)
  const filtrando = search.trim().length > 0 || filter !== 'todos' || tag !== null

  return (
    <section className="page page--decks">
      <header className="intro">
        <h1 className="page__title">Tus mazos</h1>
        <p className="intro__subtitle">
          {totalDue > 0
            ? `Tienes ${totalDue} ${totalDue === 1 ? 'carta pendiente' : 'cartas pendientes'} hoy.`
            : 'Hoy no te toca nada. Sigue así.'}
        </p>
      </header>

      {/* Mientras se crea un mazo, fuera los controles de la lista: estás en una
          tarea, no navegando. El botón de estudiar además competiría con «Crear». */}
      {summaries.length > 0 && !creating && (
        <>
          {totalDue > 0 && (
            <Link className="button button--wide" to="/estudiar">
              Estudiar todo · {totalDue} {totalDue === 1 ? 'carta' : 'cartas'}
            </Link>
          )}

          {summaries.length > 3 && (
            <label className="search">
              <SearchIcon />
              <input
                type="search"
                className="search__input"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar mazos…"
                aria-label="Buscar mazos"
              />
            </label>
          )}

          <div className="chips" role="group" aria-label="Filtrar mazos">
            <button
              type="button"
              className={filter === 'todos' && !tag ? 'chip is-active' : 'chip'}
              onClick={() => {
                setFilter('todos')
                setTag(null)
              }}
            >
              Todos
            </button>
            <button
              type="button"
              className={filter === 'pendientes' ? 'chip is-active' : 'chip'}
              onClick={() => setFilter(filter === 'pendientes' ? 'todos' : 'pendientes')}
            >
              Pendientes
            </button>
            {tags.map((nombre) => (
              <button
                key={nombre}
                type="button"
                className={tag === nombre ? 'chip is-active' : 'chip'}
                onClick={() => setTag(nombre === tag ? null : nombre)}
              >
                {nombre}
              </button>
            ))}
          </div>
        </>
      )}

      {creating && <NewDeckForm onClose={() => setCreating(false)} />}

      {visible.length === 0 ? (
        <div className="empty">
          <p className="empty__text">
            {summaries.length === 0
              ? 'Todavía no hay ningún mazo.'
              : 'Ningún mazo con ese filtro.'}
          </p>
          <p className="empty__hint">
            {summaries.length === 0
              ? 'Crea uno y empieza a meterle cartas.'
              : 'Prueba a quitar el filtro o a buscar otra cosa.'}
          </p>
        </div>
      ) : (
        <ul className="decks">
          {visible.map((item) => (
            <DeckRow key={item.deck.id} summary={item} />
          ))}
        </ul>
      )}

      {/* Pegado sobre la barra inferior: con muchos mazos, crear uno nuevo no
          debería obligar a desplazarse hasta el final. */}
      {!creating && !filtrando && (
        <div className="decks__new">
          <button type="button" className="button" onClick={() => setCreating(true)}>
            <PlusIcon />
            Nuevo mazo
          </button>
          {/* El importador crea el mazo él mismo, así que no hace falta crearlo
              antes para tener dónde meter los apuntes. */}
          <Link className="button button--ghost" to="/importar">
            Importar
          </Link>
        </div>
      )}
    </section>
  )
}

function DeckRow({ summary }: { summary: DeckSummary }) {
  const { deck, total, due, mastered } = summary
  const color = deckColor(deck.id)
  const progreso = total > 0 ? mastered / total : 0

  return (
    <li className={`deck deck--${color}`}>
      <Link className="deck__link" to={`/mazo/${deck.id}`}>
        <span className={deck.emoji ? 'deck__tile deck__tile--emoji' : 'deck__tile'} aria-hidden>
          {deck.emoji || deckInitials(deck.name)}
        </span>

        <span className="deck__body">
          <span className="deck__head">
            <span className="deck__name">{deck.name}</span>
            {due > 0 && <span className="deck__due">{due}</span>}
          </span>

          <span className="deck__meta">
            {total} {total === 1 ? 'tarjeta' : 'tarjetas'}
            {deck.tags.length > 0 && ` · ${deck.tags.join(', ')}`}
          </span>

          <span className="deck__progress">
            <span className="deck__track">
              <span className="deck__fill" style={{ width: `${progreso * 100}%` }} />
            </span>
            <span className="deck__count">
              {mastered}/{total}
            </span>
          </span>
        </span>
      </Link>

      {total > 0 && (
        <Link
          className="deck__practice"
          to={`/mazo/${deck.id}/practicar`}
          aria-label={`Práctica libre de ${deck.name}`}
          title="Práctica libre"
        >
          <svg viewBox="0 0 24 24" aria-hidden focusable="false">
            <path d="M8 5.5 18.5 12 8 18.5z" />
          </svg>
        </Link>
      )}
    </li>
  )
}

function SearchIcon() {
  return (
    <svg
      className="search__icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg
      className="button__icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M12 6v12M6 12h12" />
    </svg>
  )
}

function NewDeckForm({ onClose }: { onClose: () => void }) {
  const formRef = useRef<HTMLFormElement>(null)
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [saving, setSaving] = useState(false)

  const canSave = name.trim().length > 0 && !saving

  // El botón que abre el formulario está pegado abajo y el formulario sale
  // arriba, así que sin esto puede aparecer fuera de la pantalla. Antes lo
  // arrastraba el foco automático del campo, que era justo lo que abría el
  // teclado sin pedirlo.
  // El botón que abre el formulario está pegado abajo, así que sin esto el
  // formulario aparece fuera de la pantalla. Antes lo arrastraba el foco
  // automático del campo, que era justo lo que abría el teclado sin pedirlo.
  //
  // Se sube del todo en vez de desplazarse hasta el formulario: al abrirlo
  // desaparecen los controles de la lista, así que el formulario ya es lo
  // primero de la página. scrollIntoView dependía de la geometría y el
  // navegador la reajustaba por su cuenta al crecer la página.
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!canSave) return
    setSaving(true)
    await createDeck({ name, emoji, description, tags: parseTags(tags) })
    onClose()
  }

  return (
    <form ref={formRef} className="form" onSubmit={(event) => void handleSubmit(event)}>
      <label className="field">
        <span className="field__label">Nombre</span>
        <input
          className="input"
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Anatomía, Alemán A2, Estructuras de datos…"
        />
      </label>

      <div className="field">
        <span className="field__label">Icono (opcional)</span>
        <EmojiPicker value={emoji} onChange={setEmoji} fallback={deckInitials(name)} />
      </div>

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

      {/* El importador crea el mazo él mismo, así que desde aquí se puede saltar
          directo sin llegar a pulsar «Crear». El nombre escrito se lleva consigo
          para no tener que teclearlo otra vez. */}
      <p className="form__aside">
        ¿Ya tienes apuntes?{' '}
        <Link to="/importar" state={{ name }}>
          Impórtalos
        </Link>{' '}
        y el mazo se crea solo.
      </p>
    </form>
  )
}
