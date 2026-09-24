import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router'

import { listAllDueCards, listDueCards, nextDueDate } from '../../data/cards'
import { getDeck } from '../../data/decks'
import { saveReview } from '../../data/reviews'
import { gradeCard } from '../../domain/leitner'
import { answer, currentCard, isFinished, startSession, type Session } from '../../domain/session'
import type { Grade } from '../../domain/types'
import { daysUntil, fromIsoDate, type IsoDate } from '../../lib/date'
import { Flashcard } from './Flashcard'
import { useSwipe } from './useSwipe'

export function StudyPage() {
  // Sin deckId, la sesión es de todos los mazos a la vez.
  const { deckId } = useParams()
  const backTo = deckId ? `/mazo/${deckId}` : '/'

  const [session, setSession] = useState<Session | null>(null)
  const [flipped, setFlipped] = useState(false)
  const [deckName, setDeckName] = useState<string>()
  /** undefined mientras no se ha consultado; null si no hay ninguna carta. */
  const [nextDue, setNextDue] = useState<IsoDate | null | undefined>(undefined)
  const saving = useRef(false)

  useEffect(() => {
    let cancelled = false

    // A propósito una lectura única y no useLiveQuery: la sesión es una foto
    // del momento de empezar. Si fuese reactiva, guardar cada repaso la
    // reharía desde cero y la cola se barajaría entre carta y carta.
    void Promise.all([
      deckId ? listDueCards(deckId) : listAllDueCards(),
      deckId ? getDeck(deckId) : Promise.resolve(undefined),
    ]).then(([cards, deck]) => {
      if (cancelled) return
      setDeckName(deck?.name)
      setSession(startSession(cards))
    })

    return () => {
      cancelled = true
    }
  }, [deckId])

  const finished = session !== null && isFinished(session)

  // La próxima fecha se consulta al terminar, no al empezar: al empezar todas
  // las cartas de la sesión vencen hoy, así que preguntarlo entonces siempre
  // respondería «hoy» y el resumen mentiría.
  useEffect(() => {
    if (!finished) return
    let cancelled = false
    void nextDueDate(deckId).then((due) => {
      if (!cancelled) setNextDue(due ?? null)
    })
    return () => {
      cancelled = true
    }
  }, [finished, deckId])

  const handleGrade = useCallback(
    async (grade: Grade) => {
      // Sin este cierre, dos toques rápidos calificarían la misma carta dos veces.
      if (saving.current) return
      const card = session && currentCard(session)
      if (!card) return

      saving.current = true
      try {
        const graded = gradeCard(card, grade)
        await saveReview(graded)
        setSession((current) => (current ? answer(current, graded.card, grade) : current))
        setFlipped(false)
      } finally {
        saving.current = false
      }
    },
    [session],
  )

  const { offset, dragging, wasDragged, handlers } = useSwipe({
    // No se puede calificar una carta sin haber visto la respuesta.
    enabled: flipped,
    onSwipe: (direction) => void handleGrade(direction === 'left' ? 'again' : 'good'),
  })

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === ' ' || event.key === 'Enter') {
        // Si el foco está en la propia carta, su botón ya gestiona la pulsación.
        if ((event.target as HTMLElement).closest?.('.flashcard__inner')) return
        event.preventDefault()
        setFlipped((value) => !value)
        return
      }
      if (!flipped) return
      if (event.key === '1') void handleGrade('again')
      if (event.key === '2') void handleGrade('good')
      if (event.key === '3') void handleGrade('easy')
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [flipped, handleGrade])

  if (!session) {
    return (
      <section className="page">
        <p className="empty__hint">Cargando…</p>
      </section>
    )
  }

  const title = deckName ?? 'Todos los mazos'

  if (finished) {
    return (
      <section className="page">
        <Link className="back" to={backTo}>
          ← {deckName ? 'Volver al mazo' : 'Mis mazos'}
        </Link>
        {session.total === 0 ? (
          <NothingDue title={title} nextDue={nextDue} deckId={deckId} />
        ) : (
          <Summary session={session} nextDue={nextDue} backTo={backTo} deckName={deckName} />
        )}
      </section>
    )
  }

  const card = currentCard(session)!
  const progress = session.completed / session.total

  return (
    <section className="page page--study">
      <div className="study__top">
        <Link className="back" to={backTo}>
          ← Salir
        </Link>
        <span className="study__counter">
          {session.completed} de {session.total}
        </span>
      </div>

      <div
        className="progress"
        role="progressbar"
        aria-valuenow={session.completed}
        aria-valuemin={0}
        aria-valuemax={session.total}
      >
        <div className="progress__bar" style={{ width: `${progress * 100}%` }} />
      </div>

      <Flashcard
        key={`${card.id}-${session.reviews}`}
        front={card.front}
        back={card.back}
        flipped={flipped}
        onFlip={() => {
          if (wasDragged()) return
          setFlipped((value) => !value)
        }}
        offset={offset}
        dragging={dragging}
        handlers={handlers}
      />

      {flipped ? (
        <div className="grades">
          <button type="button" className="grade grade--again" onClick={() => void handleGrade('again')}>
            Mal
            <small>mañana</small>
          </button>
          <button type="button" className="grade grade--good" onClick={() => void handleGrade('good')}>
            Bien
            <small>sube una caja</small>
          </button>
          <button type="button" className="grade grade--easy" onClick={() => void handleGrade('easy')}>
            Fácil
            <small>sube dos</small>
          </button>
        </div>
      ) : (
        <div className="grades">
          <button type="button" className="button button--wide" onClick={() => setFlipped(true)}>
            Ver la respuesta
          </button>
        </div>
      )}

      <p className="study__help">
        Caja {card.box} · desliza a la izquierda para Mal y a la derecha para Bien
      </p>
    </section>
  )
}

function NothingDue({
  title,
  nextDue,
  deckId,
}: {
  title: string
  nextDue: IsoDate | null | undefined
  deckId?: string
}) {
  return (
    <div className="empty">
      <p className="empty__text">Nada que repasar en {title}.</p>
      {nextDue === null ? (
        <>
          <p className="empty__hint">Todavía no hay cartas.</p>
          {deckId && (
            <p>
              <Link className="button" to={`/mazo/${deckId}/carta/nueva`}>
                Añadir la primera
              </Link>
            </p>
          )}
        </>
      ) : (
        nextDue !== undefined && <p className="empty__hint">{describeNextDue(nextDue)}</p>
      )}
    </div>
  )
}

function Summary({
  session,
  nextDue,
  backTo,
  deckName,
}: {
  session: Session
  nextDue: IsoDate | null | undefined
  backTo: string
  deckName?: string
}) {
  return (
    <div className="empty">
      <p className="empty__text">Sesión terminada.</p>
      <dl className="rows rows--summary">
        <div className="row">
          <dt className="row__label">Cartas repasadas</dt>
          <dd className="row__value">{session.total}</dd>
        </div>
        <div className="row">
          <dt className="row__label">Respuestas</dt>
          <dd className="row__value">{session.reviews}</dd>
        </div>
        <div className="row">
          <dt className="row__label">Falladas</dt>
          <dd className="row__value">{session.failed}</dd>
        </div>
      </dl>
      {nextDue && <p className="empty__hint">{describeNextDue(nextDue)}</p>}
      <p>
        <Link className="button" to={backTo}>
          {deckName ? 'Volver al mazo' : 'Volver a mis mazos'}
        </Link>
      </p>
    </div>
  )
}

function describeNextDue(date: IsoDate): string {
  const days = daysUntil(date)
  if (days <= 0) return 'Todavía quedan cartas pendientes.'
  if (days === 1) return 'La próxima toca mañana.'

  const formatted = new Intl.DateTimeFormat('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(fromIsoDate(date))

  return `La próxima toca el ${formatted}, dentro de ${days} días.`
}
