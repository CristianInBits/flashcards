import { describe, expect, it } from 'vitest'

import { DECK_COLORS, deckColor, deckInitials } from './deckColor'

describe('deckColor', () => {
  it('siempre devuelve uno de los colores definidos', () => {
    for (let i = 0; i < 200; i++) {
      expect(DECK_COLORS).toContain(deckColor(crypto.randomUUID()))
    }
  })

  it('el mismo mazo tiene siempre el mismo color', () => {
    const id = '3f2504e0-4f89-41d3-9a0c-0305e82c3301'
    expect(deckColor(id)).toBe(deckColor(id))
  })

  it('reparte razonablemente entre los cinco colores', () => {
    const cuenta = new Map(DECK_COLORS.map((c) => [c, 0]))
    for (let i = 0; i < 500; i++) {
      const color = deckColor(crypto.randomUUID())
      cuenta.set(color, cuenta.get(color)! + 1)
    }
    // Con 500 mazos y 5 colores, ninguno debería quedarse por debajo del 10%.
    for (const [, veces] of cuenta) expect(veces).toBeGreaterThan(50)
  })

  it('aguanta un id vacío', () => {
    expect(DECK_COLORS).toContain(deckColor(''))
  })
})

describe('deckInitials', () => {
  it('una palabra da una letra', () => {
    expect(deckInitials('Álgebra')).toBe('Á')
  })

  it('dos palabras dan dos letras', () => {
    expect(deckInitials('Historia Moderna')).toBe('HM')
  })

  it('se salta las palabras de enlace', () => {
    expect(deckInitials('Vocabulario de Inglés')).toBe('VI')
    expect(deckInitials('Historia del Arte')).toBe('HA')
  })

  it('ignora los espacios de sobra', () => {
    expect(deckInitials('  Química   Orgánica  ')).toBe('QO')
  })

  it('aguanta un nombre que empieza por emoji', () => {
    expect(deckInitials('🌍 Geografía')).toBe('🌍G')
  })

  it('con un nombre vacío no se rompe', () => {
    expect(deckInitials('')).toBe('?')
    expect(deckInitials('   ')).toBe('?')
  })

  it('un nombre que es solo enlaces no se rompe', () => {
    expect(deckInitials('de la')).toBe('?')
  })
})
