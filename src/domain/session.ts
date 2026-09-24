import type { Card, Grade } from './types'

/**
 * Una sesión de estudio: una cola de cartas y unos contadores.
 *
 * No hay tope de cartas —eso se decidió en el plan—: la sesión termina cuando
 * no queda nada vencido. Las falladas vuelven al final de la cola, así que una
 * carta que no te sabes la ves más de una vez el mismo día.
 *
 * Es inmutable a propósito: cada respuesta devuelve una sesión nueva. Así la
 * pantalla no puede quedarse a medias y los tests son triviales.
 */
export interface Session {
  /** Cartas pendientes. La primera es la que se está viendo. */
  readonly queue: readonly Card[]
  /** Cartas distintas con las que empezó la sesión. */
  readonly total: number
  /** Cartas distintas ya superadas (Bien o Fácil). */
  readonly completed: number
  /** Respuestas dadas, contando las repeticiones de las falladas. */
  readonly reviews: number
  /** Veces que se ha respondido Mal. */
  readonly failed: number
}

export type Shuffle = <T>(items: readonly T[]) => T[]

/** Fisher-Yates. `random` se inyecta para poder fijarlo en los tests. */
export function shuffleWith(random: () => number): Shuffle {
  return <T,>(items: readonly T[]): T[] => {
    const result = [...items]
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1))
      ;[result[i], result[j]] = [result[j], result[i]]
    }
    return result
  }
}

const defaultShuffle = shuffleWith(Math.random)

export function startSession(cards: readonly Card[], shuffle: Shuffle = defaultShuffle): Session {
  const queue = shuffle(cards)
  return { queue, total: queue.length, completed: 0, reviews: 0, failed: 0 }
}

export function currentCard(session: Session): Card | undefined {
  return session.queue[0]
}

export function isFinished(session: Session): boolean {
  return session.queue.length === 0
}

/**
 * Registra una respuesta.
 *
 * `graded` es la carta ya actualizada por el motor Leitner: la sesión no sabe
 * nada de cajas ni de fechas, solo de qué va delante y qué se repite.
 */
export function answer(session: Session, graded: Card, grade: Grade): Session {
  const rest = session.queue.slice(1)
  const repeat = grade === 'again'

  return {
    queue: repeat ? [...rest, graded] : rest,
    total: session.total,
    completed: repeat ? session.completed : session.completed + 1,
    reviews: session.reviews + 1,
    failed: repeat ? session.failed + 1 : session.failed,
  }
}
