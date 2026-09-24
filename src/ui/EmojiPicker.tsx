import { useState } from 'react'

import { DECK_EMOJIS, emojiName } from '../lib/emoji'

interface Props {
  value: string
  onChange: (emoji: string) => void
  /** Lo que se vería en la ficha si no hay icono: las iniciales del nombre. */
  fallback: string
}

/**
 * Elige el icono de un mazo.
 *
 * La rejilla empieza cerrada a propósito: en el formulario de crear un mazo,
 * sesenta botones entre el nombre y «Crear» convierten tres campos en una
 * pantalla de desplazarse.
 *
 * Al lado va la ficha tal y como va a quedar en la lista, con las iniciales
 * mientras no haya icono: enseñar el resultado ahorra explicarlo.
 */
export function EmojiPicker({ value, onChange, fallback }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="emoji">
      <div className="emoji__row">
        <span
          className={value ? 'emoji__preview emoji__preview--icon' : 'emoji__preview'}
          role="img"
          aria-label={value ? `Icono: ${emojiName(value)}` : 'Sin icono: se usan las iniciales'}
        >
          {value || fallback}
        </span>

        <button type="button" className="chip" aria-expanded={open} onClick={() => setOpen(!open)}>
          {open ? 'Cerrar' : value ? 'Cambiar icono' : 'Elegir icono'}
        </button>

        {value && (
          <button
            type="button"
            className="chip"
            onClick={() => {
              onChange('')
              setOpen(false)
            }}
          >
            Quitar
          </button>
        )}
      </div>

      {open && (
        <div className="emoji__grid" role="group" aria-label="Iconos para el mazo">
          {DECK_EMOJIS.map(({ emoji, name }) => (
            <button
              key={emoji}
              type="button"
              className={emoji === value ? 'emoji__option is-active' : 'emoji__option'}
              aria-label={name}
              aria-pressed={emoji === value}
              title={name}
              onClick={() => {
                onChange(emoji)
                setOpen(false)
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
