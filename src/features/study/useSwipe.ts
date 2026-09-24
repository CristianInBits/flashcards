import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'

export type SwipeDirection = 'left' | 'right'

/** Distancia mínima para que cuente como gesto y no como toque tembloroso. */
const THRESHOLD = 90

/** A partir de aquí se considera arrastre y el toque ya no voltea la carta. */
const DRAG_START = 8

interface Options {
  onSwipe: (direction: SwipeDirection) => void
  enabled: boolean
}

/**
 * Deslizar horizontalmente sobre la carta.
 *
 * Solo horizontal: el vertical se deja al scroll de la página, porque una carta
 * con una respuesta larga tiene que poder desplazarse. Por eso «Fácil» no tiene
 * gesto y se queda en el botón.
 */
export function useSwipe({ onSwipe, enabled }: Options) {
  const [offset, setOffset] = useState(0)
  const [dragging, setDragging] = useState(false)
  const start = useRef<{ x: number; y: number } | null>(null)
  const moved = useRef(false)

  function onPointerDown(event: ReactPointerEvent<HTMLElement>) {
    // Se reinicia antes de mirar `enabled`: si no, tras un deslizamiento la
    // marca se queda puesta —la carta siguiente aparece sin voltear, así que
    // `enabled` es false y no se llegaba a limpiar— y el siguiente toque se
    // confunde con el final de un arrastre, de modo que la carta ya no voltea.
    moved.current = false
    if (!enabled) return
    start.current = { x: event.clientX, y: event.clientY }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function onPointerMove(event: ReactPointerEvent<HTMLElement>) {
    if (!start.current) return
    const dx = event.clientX - start.current.x
    const dy = event.clientY - start.current.y

    // Si el dedo va claramente hacia abajo o arriba, es scroll: no lo robamos.
    if (!moved.current && Math.abs(dy) > Math.abs(dx)) {
      start.current = null
      return
    }

    if (Math.abs(dx) > DRAG_START) {
      moved.current = true
      setDragging(true)
    }
    setOffset(dx)
  }

  function onPointerUp() {
    const distance = offset
    start.current = null
    setDragging(false)
    setOffset(0)

    if (Math.abs(distance) >= THRESHOLD) {
      onSwipe(distance < 0 ? 'left' : 'right')
    }
  }

  function onPointerCancel() {
    start.current = null
    moved.current = false
    setDragging(false)
    setOffset(0)
  }

  return {
    offset,
    dragging,
    /** True si el puntero se ha movido lo bastante como para no tratarlo como un toque. */
    wasDragged: () => moved.current,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel },
  }
}
