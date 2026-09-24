import { describe, expect, it } from 'vitest'

import { detectFormat, parseCards, parseDelimited } from './import'

describe('parseDelimited', () => {
  it('parte por el delimitador', () => {
    expect(parseDelimited('a,b,c', ',')).toEqual([['a', 'b', 'c']])
  })

  it('respeta el delimitador dentro de comillas', () => {
    expect(parseDelimited('"uno, dos",tres', ',')).toEqual([['uno, dos', 'tres']])
  })

  it('entiende las comillas escapadas duplicándolas', () => {
    expect(parseDelimited('"dijo ""hola""",fin', ',')).toEqual([['dijo "hola"', 'fin']])
  })

  it('admite saltos de línea dentro de un campo entrecomillado', () => {
    expect(parseDelimited('"primera\nsegunda",b', ',')).toEqual([['primera\nsegunda', 'b']])
  })

  it('separa filas', () => {
    expect(parseDelimited('a,b\nc,d', ',')).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ])
  })

  it('se traga los finales de línea de Windows', () => {
    expect(parseDelimited('a,b\r\nc,d', ',')).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ])
  })

  it('no inventa una fila vacía al final', () => {
    expect(parseDelimited('a,b\n', ',')).toEqual([['a', 'b']])
  })
})

describe('detectFormat', () => {
  it('reconoce el formato de una línea por carta', () => {
    expect(detectFormat('Capital de Francia :: París\nSodio :: Na')).toBe('inline')
  })

  it('reconoce encabezados', () => {
    expect(detectFormat('## Pregunta\n\nLa respuesta va aquí.')).toBe('headings')
  })

  it('reconoce CSV con comas', () => {
    expect(detectFormat('anverso,reverso\nSodio,Na')).toBe('csv')
  })

  it('reconoce el punto y coma que exporta Excel en español', () => {
    expect(detectFormat('Sodio;Na\nPotasio;K')).toBe('csv')
  })

  it('reconoce tabulaciones', () => {
    expect(detectFormat('Sodio\tNa\nPotasio\tK')).toBe('csv')
  })

  it('con texto vacío no se rompe', () => {
    expect(detectFormat('')).toBe('inline')
  })
})

describe('parseCards · inline', () => {
  it('parte por el primer ::', () => {
    const result = parseCards('Capital de Francia :: París', 'inline')
    expect(result.cards).toEqual([{ front: 'Capital de Francia', back: 'París' }])
  })

  it('deja los :: siguientes en la respuesta', () => {
    const result = parseCards('Sintaxis :: usa a :: b para separar', 'inline')
    expect(result.cards).toEqual([{ front: 'Sintaxis', back: 'usa a :: b para separar' }])
  })

  it('ignora las líneas en blanco sin contarlas como descartadas', () => {
    const result = parseCards('a :: b\n\n\nc :: d', 'inline')
    expect(result.cards).toHaveLength(2)
    expect(result.skipped).toEqual([])
  })

  it('informa de las líneas sin separador', () => {
    const result = parseCards('a :: b\nesta línea sobra', 'inline')
    expect(result.cards).toHaveLength(1)
    expect(result.skipped).toEqual(['esta línea sobra'])
  })

  it('descarta las que tienen un lado vacío', () => {
    const result = parseCards('a ::\n:: b', 'inline')
    expect(result.cards).toEqual([])
    expect(result.skipped).toHaveLength(2)
  })
})

describe('parseCards · headings', () => {
  it('el encabezado es la pregunta y lo de debajo la respuesta', () => {
    const text = '## ¿Qué es la mitocondria?\n\nLa central energética de la célula.'
    expect(parseCards(text, 'headings').cards).toEqual([
      { front: '¿Qué es la mitocondria?', back: 'La central energética de la célula.' },
    ])
  })

  it('un encabezado nuevo cierra la carta anterior', () => {
    const text = '# Uno\n\nPrimera\n\n# Dos\n\nSegunda'
    expect(parseCards(text, 'headings').cards).toEqual([
      { front: 'Uno', back: 'Primera' },
      { front: 'Dos', back: 'Segunda' },
    ])
  })

  it('cualquier nivel de encabezado empieza carta, sin anidar', () => {
    const text = '## Padre\n\nCuerpo del padre\n\n### Hijo\n\nCuerpo del hijo'
    expect(parseCards(text, 'headings').cards).toHaveLength(2)
  })

  it('conserva el Markdown de la respuesta', () => {
    const text = '## Derivada\n\n$$f\'(x) = 2x$$\n\n- primero\n- segundo'
    expect(parseCards(text, 'headings').cards[0].back).toBe(
      "$$f'(x) = 2x$$\n\n- primero\n- segundo",
    )
  })

  it('informa de los encabezados sin cuerpo', () => {
    const result = parseCards('## Vacío\n\n## Con cuerpo\n\nAlgo', 'headings')
    expect(result.cards).toHaveLength(1)
    expect(result.skipped).toEqual(['Vacío'])
  })

  it('ignora el texto anterior al primer encabezado', () => {
    const result = parseCards('Introducción suelta\n\n## Pregunta\n\nRespuesta', 'headings')
    expect(result.cards).toEqual([{ front: 'Pregunta', back: 'Respuesta' }])
  })
})

describe('parseCards · csv', () => {
  it('toma las dos primeras columnas', () => {
    expect(parseCards('Sodio,Na', 'csv').cards).toEqual([{ front: 'Sodio', back: 'Na' }])
  })

  it('se salta la fila de cabecera si la reconoce', () => {
    const result = parseCards('anverso,reverso\nSodio,Na', 'csv')
    expect(result.cards).toEqual([{ front: 'Sodio', back: 'Na' }])
  })

  it('no se salta una fila que solo parece cabecera', () => {
    const result = parseCards('Sodio,Na\nPotasio,K', 'csv')
    expect(result.cards).toHaveLength(2)
  })

  it('ignora las columnas de más', () => {
    expect(parseCards('Sodio,Na,metal,11', 'csv').cards).toEqual([{ front: 'Sodio', back: 'Na' }])
  })

  it('una respuesta con comas entrecomillada no rompe nada', () => {
    const result = parseCards('"Planetas rocosos","Mercurio, Venus, Tierra y Marte"', 'csv')
    expect(result.cards).toEqual([
      { front: 'Planetas rocosos', back: 'Mercurio, Venus, Tierra y Marte' },
    ])
  })

  it('informa de las filas con una sola columna', () => {
    const result = parseCards('Sodio,Na\nsobra', 'csv')
    expect(result.cards).toHaveLength(1)
    expect(result.skipped).toEqual(['sobra'])
  })

  it('ignora las filas completamente vacías', () => {
    const result = parseCards('Sodio,Na\n,\nPotasio,K', 'csv')
    expect(result.cards).toHaveLength(2)
    expect(result.skipped).toEqual([])
  })
})
