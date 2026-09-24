/**
 * Los iconos que se le pueden poner a un mazo.
 *
 * La lista va escrita a mano en vez de traerse un paquete con los miles de
 * emojis del estándar: elegir entre sesenta de un vistazo es cuestión de un
 * dedo, y elegir entre miles obliga a un buscador con su índice, su teclado y
 * su pantalla. Están los que tienen que ver con estudiar algo, que es de lo
 * que va esto.
 *
 * El nombre no es decoración: es lo que lee el lector de pantalla, porque un
 * botón cuyo único contenido es «🧪» no dice nada.
 */

export interface EmojiOption {
  emoji: string
  name: string
}

export const DECK_EMOJIS: readonly EmojiOption[] = [
  // Estudiar
  { emoji: '📚', name: 'Libros' },
  { emoji: '📖', name: 'Libro abierto' },
  { emoji: '📝', name: 'Apuntes' },
  { emoji: '✏️', name: 'Lápiz' },
  { emoji: '🎓', name: 'Birrete' },
  { emoji: '🧠', name: 'Cerebro' },
  { emoji: '💡', name: 'Bombilla' },
  { emoji: '🔖', name: 'Marcapáginas' },

  // Idiomas. Sin banderas: Windows no trae glifos para ellas y las dibuja como
  // las dos letras del país («ES», «GB»), que es justo el aspecto de iniciales
  // del que se huye al poner un icono.
  { emoji: '🗣️', name: 'Hablar' },
  { emoji: '💬', name: 'Conversación' },
  { emoji: '🔤', name: 'Abecedario' },
  { emoji: '🌐', name: 'Globo terráqueo' },
  { emoji: '🔠', name: 'Letras' },
  { emoji: '🎤', name: 'Micrófono' },

  // Escribir
  { emoji: '📜', name: 'Pergamino' },
  { emoji: '✒️', name: 'Pluma' },
  { emoji: '📓', name: 'Cuaderno' },
  { emoji: '📰', name: 'Periódico' },

  // Ciencias
  { emoji: '🔬', name: 'Microscopio' },
  { emoji: '🧪', name: 'Probeta' },
  { emoji: '⚗️', name: 'Alambique' },
  { emoji: '🧬', name: 'ADN' },
  { emoji: '🔭', name: 'Telescopio' },
  { emoji: '⚛️', name: 'Átomo' },
  { emoji: '🦠', name: 'Microbio' },

  // Números
  { emoji: '➗', name: 'División' },
  { emoji: '📐', name: 'Escuadra' },
  { emoji: '🧮', name: 'Ábaco' },
  { emoji: '📊', name: 'Gráfico de barras' },
  { emoji: '📈', name: 'Gráfico al alza' },

  // Mundo e historia
  { emoji: '🌍', name: 'Mundo' },
  { emoji: '🗺️', name: 'Mapa' },
  { emoji: '🧭', name: 'Brújula' },
  { emoji: '🏛️', name: 'Templo clásico' },
  { emoji: '🏰', name: 'Castillo' },
  { emoji: '⏳', name: 'Reloj de arena' },

  // Tecnología
  { emoji: '💻', name: 'Portátil' },
  { emoji: '⌨️', name: 'Teclado' },
  { emoji: '🤖', name: 'Robot' },
  { emoji: '⚙️', name: 'Engranaje' },

  // Cuerpo y salud
  { emoji: '🫀', name: 'Corazón' },
  { emoji: '🦴', name: 'Hueso' },
  { emoji: '🩺', name: 'Estetoscopio' },
  { emoji: '💊', name: 'Pastilla' },

  // Arte
  { emoji: '🎨', name: 'Paleta de pintura' },
  { emoji: '🎵', name: 'Nota musical' },
  { emoji: '🎬', name: 'Claqueta' },
  { emoji: '🎭', name: 'Máscaras de teatro' },

  // Naturaleza
  { emoji: '🌱', name: 'Brote' },
  { emoji: '🌳', name: 'Árbol' },
  { emoji: '🐾', name: 'Huellas' },
  { emoji: '🪐', name: 'Planeta' },
  { emoji: '⭐', name: 'Estrella' },
  { emoji: '🔥', name: 'Fuego' },

  // Y lo demás
  { emoji: '⚖️', name: 'Balanza' },
  { emoji: '💰', name: 'Dinero' },
  { emoji: '🍳', name: 'Sartén' },
  { emoji: '⚽', name: 'Balón' },
  { emoji: '🧩', name: 'Pieza de puzle' },
  { emoji: '🔑', name: 'Llave' },
]

/**
 * Separa por grafemas, que es lo que se ve, y no por puntos de código: «🇪🇸»
 * son dos puntos de código y un solo icono en pantalla.
 */
const grafemas = new Intl.Segmenter('es', { granularity: 'grapheme' })

/**
 * Deja un icono en condiciones de guardarse: sin espacios alrededor y de un
 * solo carácter visible.
 *
 * El selector solo ofrece los de la lista, así que esto es para lo que entra
 * por la puerta de atrás: una copia de seguridad editada a mano. En la ficha
 * cabe un icono, no una frase.
 */
export function normalizeEmoji(value: string): string {
  const limpio = value.trim()
  if (limpio.length === 0) return ''
  return [...grafemas.segment(limpio)][0]?.segment ?? ''
}

/** El nombre del icono, para leerlo en voz alta. Si no está en la lista, él mismo. */
export function emojiName(emoji: string): string {
  return DECK_EMOJIS.find((option) => option.emoji === emoji)?.name ?? emoji
}
