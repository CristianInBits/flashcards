import { describe, expect, it } from 'vitest'

import { toPlainText } from './plainText'

describe('toPlainText', () => {
  it('quita negritas y cursivas', () => {
    expect(toPlainText('Una **cosa** y otra _distinta_')).toBe('Una cosa y otra distinta')
  })

  it('deja el LaTeX legible sin los delimitadores', () => {
    expect(toPlainText('La derivada de $f(x) = x^n$')).toBe('La derivada de f(x) = x^n')
    expect(toPlainText('$$E = mc^2$$')).toBe('E = mc^2')
  })

  it('conserva el código y se come las vallas', () => {
    expect(toPlainText('Así:\n\n```python\nprint(1)\n```')).toBe('Así: print(1)')
  })

  it('no confunde los asteriscos del código con cursiva', () => {
    const card = '```python\nreturn n * x ** (n - 1)\n```'
    expect(toPlainText(card)).toBe('return n * x ** (n - 1)')
  })

  it('tampoco los del código en línea', () => {
    expect(toPlainText('Se escribe `a ** b` en Python')).toBe('Se escribe a ** b en Python')
  })

  it('sigue quitando el énfasis de alrededor del código', () => {
    expect(toPlainText('**Ojo** con `x * y`')).toBe('Ojo con x * y')
  })

  it('se queda con el texto de enlaces e imágenes', () => {
    expect(toPlainText('Ver [la tabla](https://ejemplo.com)')).toBe('Ver la tabla')
    expect(toPlainText('![diagrama del ciclo](ciclo.png)')).toBe('diagrama del ciclo')
  })

  it('quita encabezados, citas y viñetas', () => {
    expect(toPlainText('## Título')).toBe('Título')
    expect(toPlainText('> Una cita')).toBe('Una cita')
    expect(toPlainText('- uno\n- dos')).toBe('uno dos')
    expect(toPlainText('1. primero\n2. segundo')).toBe('primero segundo')
  })

  it('colapsa los saltos de línea en una sola línea', () => {
    expect(toPlainText('Una\n\nlínea\n\n\ny otra')).toBe('Una línea y otra')
  })

  it('aguanta una carta con de todo', () => {
    const card = '$$f\'(x) = n\\,x^{n-1}$$\n\nEn **Python**:\n\n```python\ndef f(n):\n    return n\n```'
    expect(toPlainText(card)).toBe("f'(x) = n\\,x^{n-1} En Python: def f(n): return n")
  })

  it('con texto vacío devuelve cadena vacía', () => {
    expect(toPlainText('   \n\n  ')).toBe('')
  })
})
