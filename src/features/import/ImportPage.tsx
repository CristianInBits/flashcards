import { useMemo, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Link, useNavigate, useParams } from 'react-router'

import { createDeck, getDeck, listDecks } from '../../data/decks'
import { importCards } from '../../data/importCards'
import { detectFormat, parseCards, type ImportFormat } from '../../domain/import'

const PREVIEW_LIMIT = 8

/** Valor del selector de destino cuando hay que crear el mazo. */
const NUEVO = '\u0000nuevo'

const FORMATS: { value: ImportFormat | 'auto'; label: string }[] = [
  { value: 'auto', label: 'Detectar' },
  { value: 'inline', label: 'Una línea' },
  { value: 'headings', label: 'Encabezados' },
  { value: 'csv', label: 'CSV' },
]

/**
 * Importa cartas desde texto o fichero.
 *
 * Con `/mazo/:deckId/importar` van al mazo indicado. Con `/importar` a secas hay
 * que elegir destino, y una de las opciones es crear un mazo nuevo: obligar a
 * crear el mazo antes deja un mazo vacío que borrar si el fichero no valía.
 */
export function ImportPage() {
  const { deckId } = useParams()
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)

  const [text, setText] = useState('')
  const [chosen, setChosen] = useState<ImportFormat | 'auto'>('auto')
  const [target, setTarget] = useState<string>(NUEVO)
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState(false)

  const deck = useLiveQuery(
    async () => (deckId ? ((await getDeck(deckId)) ?? null) : undefined),
    [deckId],
  )
  const decks = useLiveQuery(() => (deckId ? Promise.resolve([]) : listDecks()), [deckId], [])

  const format = chosen === 'auto' ? detectFormat(text) : chosen
  const result = useMemo(() => parseCards(text, format), [text, format])

  const creaMazo = !deckId && target === NUEVO
  const destinoListo = Boolean(deckId) || (creaMazo ? newName.trim().length > 0 : target !== NUEVO)
  const puedeImportar = result.cards.length > 0 && destinoListo && !saving

  async function handleFile(file: File) {
    setText(await file.text())
    setChosen('auto')
    // El nombre del fichero suele ser el del tema: «Anatomía tema 3.csv».
    if (!deckId && newName.trim().length === 0) {
      setNewName(file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim())
    }
  }

  async function handleImport() {
    if (!puedeImportar) return
    setSaving(true)
    try {
      const destino = deckId ?? (creaMazo ? (await createDeck({ name: newName })).id : target)
      await importCards(destino, result.cards)
      void navigate(`/mazo/${destino}`)
    } catch (error) {
      setSaving(false)
      throw error
    }
  }

  if (deckId && deck === null) {
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

  const volverA = deckId ? `/mazo/${deckId}` : '/'

  return (
    <section className="page">
      <Link className="back" to={volverA}>
        ← {deckId ? 'Volver al mazo' : 'Mis mazos'}
      </Link>

      <h1 className="page__title">Importar cartas</h1>
      {deck && <p className="page__subtitle">Se añadirán a «{deck.name}».</p>}

      <div className="form__actions">
        <button
          type="button"
          className="button button--ghost"
          onClick={() => fileRef.current?.click()}
        >
          Subir un fichero
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".md,.markdown,.txt,.csv,.tsv,text/plain,text/markdown,text/csv"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) void handleFile(file)
            event.target.value = ''
          }}
        />
      </div>

      <label className="field">
        <span className="field__label">O pega aquí tus apuntes</span>
        <textarea
          className="input textarea"
          rows={8}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={'Capital de Francia :: París\nSímbolo del sodio :: Na'}
        />
      </label>

      <div className="field">
        <span className="field__label">Formato</span>
        <div className="chips">
          {FORMATS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={chosen === option.value ? 'chip is-active' : 'chip'}
              onClick={() => setChosen(option.value)}
            >
              {option.label}
              {option.value === 'auto' && text.trim().length > 0 && ` · ${labelOf(format)}`}
            </button>
          ))}
        </div>
        <p className="hint">{describeFormat(format)}</p>
      </div>

      {/* Sin mazo en la ruta hay que decir dónde van las cartas. */}
      {!deckId && (
        <div className="field">
          <span className="field__label">¿A qué mazo?</span>
          <div className="chips">
            <button
              type="button"
              className={target === NUEVO ? 'chip is-active' : 'chip'}
              onClick={() => setTarget(NUEVO)}
            >
              Mazo nuevo
            </button>
            {decks.map((item) => (
              <button
                key={item.id}
                type="button"
                className={target === item.id ? 'chip is-active' : 'chip'}
                onClick={() => setTarget(item.id)}
              >
                {item.name}
              </button>
            ))}
          </div>

          {creaMazo && (
            <label className="field">
              <span className="field__label">Nombre del mazo</span>
              <input
                className="input"
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                placeholder="Anatomía, Alemán A2, Estructuras de datos…"
              />
            </label>
          )}
        </div>
      )}

      {text.trim().length > 0 && (
        <>
          <h2 className="page__title page__title--small">
            {result.cards.length} {result.cards.length === 1 ? 'carta' : 'cartas'}
          </h2>

          {result.cards.length === 0 ? (
            <div className="empty">
              <p className="empty__text">No se ha reconocido ninguna carta.</p>
              <p className="empty__hint">Prueba a elegir el formato a mano.</p>
            </div>
          ) : (
            <ul className="list">
              {result.cards.slice(0, PREVIEW_LIMIT).map((card, index) => (
                <li key={index}>
                  <div className="card-item">
                    <div className="card-item__body">
                      <span className="card-item__title">{card.front}</span>
                      <span className="card-item__subtitle">{card.back}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {result.cards.length > PREVIEW_LIMIT && (
            <p className="hint">y {result.cards.length - PREVIEW_LIMIT} más…</p>
          )}

          {result.skipped.length > 0 && (
            <details className="notice">
              <summary>
                {result.skipped.length}{' '}
                {result.skipped.length === 1 ? 'línea descartada' : 'líneas descartadas'}
              </summary>
              <ul className="notice__list">
                {result.skipped.slice(0, 20).map((line, index) => (
                  <li key={index}>{line}</li>
                ))}
              </ul>
            </details>
          )}

          <div className="form__actions">
            <button
              type="button"
              className="button"
              disabled={!puedeImportar}
              onClick={() => void handleImport()}
            >
              {creaMazo ? `Crear mazo con ${result.cards.length}` : `Importar ${result.cards.length}`}
            </button>
            <button type="button" className="button button--ghost" onClick={() => setText('')}>
              Limpiar
            </button>
          </div>

          {result.cards.length > 0 && !destinoListo && (
            <p className="hint">Ponle un nombre al mazo para poder importar.</p>
          )}
        </>
      )}
    </section>
  )
}

function labelOf(format: ImportFormat): string {
  return FORMATS.find((option) => option.value === format)?.label ?? format
}

function describeFormat(format: ImportFormat): string {
  switch (format) {
    case 'inline':
      return 'Una carta por línea, con «::» entre la pregunta y la respuesta.'
    case 'headings':
      return 'Cada encabezado (#, ##, ###…) es una pregunta y lo que va debajo, la respuesta.'
    case 'csv':
      return 'Primera columna la pregunta, segunda la respuesta. Admite comas, punto y coma o tabuladores.'
  }
}
