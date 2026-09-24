import { describe, expect, it } from 'vitest'

import { DECK_EMOJIS, emojiName, normalizeEmoji } from './emoji'

const grafemas = new Intl.Segmenter('es', { granularity: 'grapheme' })
const casillas = (texto: string) => [...grafemas.segment(texto)].length

describe('DECK_EMOJIS', () => {
  it('no repite ninguno', () => {
    const distintos = new Set(DECK_EMOJIS.map((option) => option.emoji))
    expect(distintos.size).toBe(DECK_EMOJIS.length)
  })

  it('cada uno ocupa una sola casilla de la rejilla', () => {
    // Las banderas son dos puntos de código: lo que importa es que se vean como uno.
    for (const { emoji } of DECK_EMOJIS) expect(casillas(emoji)).toBe(1)
  })

  it('todos tienen nombre, que es lo que lee el lector de pantalla', () => {
    for (const { name } of DECK_EMOJIS) expect(name.trim().length).toBeGreaterThan(0)
  })

  it('ninguno cambia al normalizarlo', () => {
    for (const { emoji } of DECK_EMOJIS) expect(normalizeEmoji(emoji)).toBe(emoji)
  })
})

describe('normalizeEmoji', () => {
  it('sin icono devuelve vacío', () => {
    expect(normalizeEmoji('')).toBe('')
    expect(normalizeEmoji('   ')).toBe('')
  })

  it('quita los espacios de alrededor', () => {
    expect(normalizeEmoji('  📚 ')).toBe('📚')
  })

  it('se queda con el primero si vienen varios', () => {
    expect(normalizeEmoji('📚📖📝')).toBe('📚')
  })

  it('no parte una bandera por la mitad', () => {
    expect(normalizeEmoji('🇪🇸')).toBe('🇪🇸')
  })

  it('respeta el selector de variación', () => {
    expect(normalizeEmoji('✏️')).toBe('✏️')
  })

  it('de una frase se queda con el primer carácter', () => {
    // No es un icono, pero viene de una copia editada a mano: que no rompa la ficha.
    expect(normalizeEmoji('hola')).toBe('h')
  })
})

describe('emojiName', () => {
  it('da el nombre de los de la lista', () => {
    expect(emojiName('🧪')).toBe('Probeta')
  })

  it('con uno de fuera devuelve el propio icono', () => {
    expect(emojiName('🥑')).toBe('🥑')
  })
})
