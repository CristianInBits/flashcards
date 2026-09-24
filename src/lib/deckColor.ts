/**
 * Color y monograma de un mazo.
 *
 * El color se deriva del identificador, no se guarda: así cada mazo tiene
 * siempre el mismo y no hay que pedirle al usuario que elija uno al crearlo.
 * Como el id es un uuid que no cambia nunca, el color tampoco.
 */
export const DECK_COLORS = ['violet', 'pink', 'mint', 'blue', 'yellow'] as const

export type DeckColor = (typeof DECK_COLORS)[number]

export function deckColor(id: string): DeckColor {
  // Suma simple de los códigos: no hace falta un hash criptográfico para
  // repartir cinco colores, solo que sea estable y esté bien repartido.
  let suma = 0
  for (let i = 0; i < id.length; i++) suma = (suma * 31 + id.charCodeAt(i)) >>> 0
  return DECK_COLORS[suma % DECK_COLORS.length]
}

/**
 * Iniciales para el tile: una letra, o dos si el nombre tiene varias palabras.
 * Se salta las palabras de enlace para que «Vocabulario de Inglés» dé «VI».
 */
const ENLACES = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'y', 'e', 'en', 'a'])

export function deckInitials(name: string): string {
  const palabras = name
    .trim()
    .split(/\s+/)
    .filter((palabra) => palabra.length > 0 && !ENLACES.has(palabra.toLowerCase()))

  if (palabras.length === 0) return '?'
  if (palabras.length === 1) return primeraLetra(palabras[0])
  return primeraLetra(palabras[0]) + primeraLetra(palabras[1])
}

function primeraLetra(palabra: string): string {
  // Con [...palabra] en vez de palabra[0] por si empieza por emoji.
  return ([...palabra][0] ?? '?').toUpperCase()
}
