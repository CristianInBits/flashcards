/**
 * Convierte Markdown en texto plano para las vistas de lista.
 *
 * Es deliberadamente una heurística con expresiones regulares, no un parser: en
 * una lista de doscientas cartas no compensa montar el árbol de cada una, y aquí
 * solo hacen falta las dos primeras líneas legibles. Para renderizar de verdad
 * está el componente Markdown.
 */

const CODE_BLOCK = /```[a-z0-9+#-]*\n?([\s\S]*?)```/gi
const INLINE_CODE = /`([^`]*)`/g

/**
 * Marca para apartar el código. Es un carácter del área de uso privado de
 * Unicode: no aparece en un texto escrito a mano y, a diferencia de \u0000, no
 * es un carácter de control (que el linter prohíbe dentro de una expresión regular).
 */
const MARK = ''
const PLACEHOLDER = new RegExp(`${MARK}(\\d+)${MARK}`, 'g')

export function toPlainText(markdown: string): string {
  // El código se aparta antes de tocar nada más. Si no, `n * x ** (n - 1)` se
  // interpreta como cursiva y el preview acaba mostrando «n x * (n - 1)».
  const code: string[] = []
  const stash = (text: string) => `${MARK}${code.push(text) - 1}${MARK}`

  const text = markdown
    .replace(CODE_BLOCK, (_match, content: string) => stash(content))
    .replace(INLINE_CODE, (_match, content: string) => stash(content))
    // Delimitadores de fórmulas: se queda el LaTeX, que al menos se lee
    .replace(/\$\$([\s\S]*?)\$\$/g, '$1')
    .replace(/\$([^$\n]*)\$/g, '$1')
    // Imágenes y enlaces: se queda el texto
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    // Marcas de bloque al principio de línea
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/^\s{0,3}[-*+]\s+/gm, '')
    .replace(/^\s{0,3}\d+[.)]\s+/gm, '')
    // Énfasis
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')

  return (
    text
      .replace(PLACEHOLDER, (_match, index: string) => code[Number(index)])
      // Todo el espacio en blanco a un solo espacio: en la lista va en una línea
      .replace(/\s+/g, ' ')
      .trim()
  )
}
