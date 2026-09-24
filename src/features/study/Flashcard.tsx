import type { PointerEvent as ReactPointerEvent } from 'react'

import { Markdown } from '../../ui/Markdown'

interface Props {
  front: string
  back: string
  flipped: boolean
  onFlip: () => void
  offset: number
  dragging: boolean
  handlers: {
    onPointerDown: (event: ReactPointerEvent<HTMLElement>) => void
    onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void
    onPointerUp: () => void
    onPointerCancel: () => void
  }
}

/** A partir de este desplazamiento la pista de «Mal» o «Bien» se ve entera. */
const HINT_FULL = 90

export function Flashcard({ front, back, flipped, onFlip, offset, dragging, handlers }: Props) {
  const hint = Math.min(Math.abs(offset) / HINT_FULL, 1)

  return (
    <div
      className="flashcard"
      style={{
        transform: `translateX(${offset}px) rotate(${offset / 30}deg)`,
        transition: dragging ? 'none' : 'transform 0.25s ease-out',
      }}
      {...handlers}
    >
      {/* Las dos caras comparten celda de la rejilla: la altura del contenedor
          es la de la más alta, así el giro no da un salto de altura. */}
      <button
        type="button"
        className={flipped ? 'flashcard__inner is-flipped' : 'flashcard__inner'}
        onClick={onFlip}
        aria-live="polite"
      >
        <div className="flashcard__face" aria-hidden={flipped}>
          <Markdown>{front}</Markdown>
          {!flipped && <span className="flashcard__nudge">Toca para ver la respuesta</span>}
        </div>
        <div className="flashcard__face flashcard__face--back" aria-hidden={!flipped}>
          <Markdown>{back}</Markdown>
        </div>
      </button>

      {offset !== 0 && (
        <span
          className={offset < 0 ? 'flashcard__hint flashcard__hint--bad' : 'flashcard__hint flashcard__hint--good'}
          style={{ opacity: hint }}
          aria-hidden
        >
          {offset < 0 ? 'Mal' : 'Bien'}
        </span>
      )}
    </div>
  )
}
