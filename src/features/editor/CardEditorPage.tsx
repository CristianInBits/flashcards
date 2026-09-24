import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'

import { createCard, deleteCard, getCard, updateCard } from '../../data/cards'
import { storeImage } from '../../data/media'
import { mediaUrl } from '../../lib/media'
import { Markdown } from '../../ui/Markdown'

type Status = 'loading' | 'ready' | 'missing'
type Side = 'front' | 'back'

export function CardEditorPage() {
  const { deckId = '', cardId } = useParams()
  const navigate = useNavigate()
  const frontRef = useRef<HTMLTextAreaElement>(null)
  const backRef = useRef<HTMLTextAreaElement>(null)
  const imageRef = useRef<HTMLInputElement>(null)
  /** La imagen se inserta donde estabas escribiendo, no siempre en el reverso. */
  const lastFocused = useRef<Side>('back')

  const [front, setFront] = useState('')
  const [back, setBack] = useState('')
  const [preview, setPreview] = useState(false)
  const [attaching, setAttaching] = useState(false)
  const [status, setStatus] = useState<Status>(cardId ? 'loading' : 'ready')

  useEffect(() => {
    if (!cardId) return
    let cancelled = false
    void getCard(cardId).then((card) => {
      if (cancelled) return
      if (!card) {
        setStatus('missing')
        return
      }
      setFront(card.front)
      setBack(card.back)
      setStatus('ready')
    })
    return () => {
      cancelled = true
    }
  }, [cardId])

  if (status === 'loading') {
    return (
      <section className="page">
        <p className="empty__hint">Cargando…</p>
      </section>
    )
  }

  if (status === 'missing') {
    return (
      <section className="page">
        <div className="empty">
          <p className="empty__text">Esta carta ya no existe.</p>
          <Link className="button" to={`/mazo/${deckId}`}>
            Volver al mazo
          </Link>
        </div>
      </section>
    )
  }

  const canSave = front.trim().length > 0 && back.trim().length > 0

  async function save() {
    if (cardId) {
      await updateCard(cardId, { front, back })
    } else {
      await createCard({ deckId, front, back })
    }
  }

  async function handleSave() {
    if (!canSave) return
    await save()
    void navigate(`/mazo/${deckId}`)
  }

  /** Para meter cartas en serie sin volver al mazo entre una y otra. */
  async function handleSaveAndNext() {
    if (!canSave) return
    await save()
    setFront('')
    setBack('')
    setPreview(false)
    frontRef.current?.focus()
  }

  async function handleDelete() {
    if (!cardId) return
    if (!window.confirm('¿Borrar esta carta?')) return
    await deleteCard(cardId)
    void navigate(`/mazo/${deckId}`)
  }

  /**
   * Guarda la imagen y deja una referencia en el texto, en la posición del
   * cursor. La imagen se queda en la base de datos aunque no llegues a guardar
   * la carta; la recogida de basura se la lleva la próxima vez que se edita o
   * se borra una carta.
   */
  async function handleImage(file: File) {
    setAttaching(true)
    try {
      const item = await storeImage(file)
      const side = lastFocused.current
      const alt = file.name.replace(/\.[^.]+$/, '')
      const snippet = `![${alt}](${mediaUrl(item.id)})`

      const target = side === 'front' ? frontRef.current : backRef.current
      const value = side === 'front' ? front : back
      const at = target?.selectionStart ?? value.length
      const needsBreak = at > 0 && !value.slice(0, at).endsWith('\n')
      const inserted = `${needsBreak ? '\n\n' : ''}${snippet}\n`
      const next = value.slice(0, at) + inserted + value.slice(at)

      if (side === 'front') setFront(next)
      else setBack(next)
    } finally {
      setAttaching(false)
    }
  }

  return (
    <section className="page">
      <Link className="back" to={`/mazo/${deckId}`}>
        ← Volver al mazo
      </Link>

      <h1 className="page__title">{cardId ? 'Editar carta' : 'Nueva carta'}</h1>

      <label className="field">
        <span className="field__label">Anverso · la pregunta</span>
        <textarea
          ref={frontRef}
          className="input textarea"
          rows={4}
          value={front}
          onChange={(event) => setFront(event.target.value)}
          onFocus={() => (lastFocused.current = 'front')}
          autoFocus
        />
      </label>

      <label className="field">
        <span className="field__label">Reverso · la respuesta</span>
        <textarea
          ref={backRef}
          className="input textarea"
          rows={6}
          value={back}
          onChange={(event) => setBack(event.target.value)}
          onFocus={() => (lastFocused.current = 'back')}
        />
      </label>

      <p className="hint">
        Admite Markdown, fórmulas entre <code>$…$</code> y bloques de código con{' '}
        <code>```lenguaje</code>.
      </p>

      <div className="form__actions">
        <button
          type="button"
          className="button button--ghost"
          disabled={attaching}
          onClick={() => imageRef.current?.click()}
        >
          {attaching ? 'Guardando imagen…' : 'Añadir imagen'}
        </button>
        <input
          ref={imageRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) void handleImage(file)
            event.target.value = ''
          }}
        />
      </div>

      <div className="form__actions">
        <button type="button" className="button" disabled={!canSave} onClick={() => void handleSave()}>
          Guardar
        </button>
        {!cardId && (
          <button
            type="button"
            className="button button--ghost"
            disabled={!canSave}
            onClick={() => void handleSaveAndNext()}
          >
            Guardar y añadir otra
          </button>
        )}
        <button
          type="button"
          className="button button--ghost"
          onClick={() => setPreview((value) => !value)}
        >
          {preview ? 'Ocultar vista previa' : 'Vista previa'}
        </button>
        {cardId && (
          <button type="button" className="button button--danger" onClick={() => void handleDelete()}>
            Borrar
          </button>
        )}
      </div>

      {preview && (
        <div className="preview">
          <span className="preview__label">Anverso</span>
          <div className="preview__face">
            <Markdown>{front || '_Vacío_'}</Markdown>
          </div>
          <span className="preview__label">Reverso</span>
          <div className="preview__face">
            <Markdown>{back || '_Vacío_'}</Markdown>
          </div>
        </div>
      )}
    </section>
  )
}
