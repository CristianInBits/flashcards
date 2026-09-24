/**
 * Convierte texto pegado o un fichero en cartas.
 *
 * Tres formatos, porque son los tres en los que la gente ya tiene sus apuntes:
 * una línea por carta con `::`, encabezados de Markdown, y CSV exportado de
 * una hoja de cálculo.
 *
 * Todo esto es puro: entra texto, salen cartas. Nada de base de datos, para
 * poder enseñar una previsualización antes de escribir nada.
 */

export type ImportFormat = 'inline' | 'headings' | 'csv'

export interface ParsedCard {
  front: string
  back: string
}

export interface ParseResult {
  cards: ParsedCard[]
  /** Trozos que no se han podido interpretar, para avisar antes de confirmar. */
  skipped: string[]
}

const INLINE_SEPARATOR = '::'
const HEADING = /^\s{0,3}(#{1,6})\s+(.*)$/

/** Coma, punto y coma (lo que exporta Excel en español) y tabulador. */
const DELIMITERS = [',', ';', '\t'] as const

const HEADER_WORDS = new Set([
  'anverso',
  'reverso',
  'pregunta',
  'respuesta',
  'front',
  'back',
  'question',
  'answer',
  'termino',
  'término',
  'definicion',
  'definición',
])

/**
 * Adivina el formato. La previsualización deja cambiarlo a mano, así que
 * acertar aquí es una comodidad, no una obligación.
 */
export function detectFormat(text: string): ImportFormat {
  const lines = text.split('\n').filter((line) => line.trim().length > 0)
  if (lines.length === 0) return 'inline'

  const withSeparator = lines.filter((line) => line.includes(INLINE_SEPARATOR)).length
  const withHeading = lines.filter((line) => HEADING.test(line)).length

  // El `::` gana si aparece en la mayoría de líneas: es el más inequívoco.
  if (withSeparator > lines.length / 2) return 'inline'
  if (withHeading > 0 && withHeading <= lines.length / 2) return 'headings'

  const delimiter = detectDelimiter(text)
  if (delimiter) return 'csv'

  return withHeading > 0 ? 'headings' : 'inline'
}

export function parseCards(text: string, format: ImportFormat): ParseResult {
  switch (format) {
    case 'inline':
      return parseInline(text)
    case 'headings':
      return parseHeadings(text)
    case 'csv':
      return parseCsv(text)
  }
}

/** `pregunta :: respuesta`, una por línea. Es el formato de los apuntes de Obsidian. */
function parseInline(text: string): ParseResult {
  const cards: ParsedCard[] = []
  const skipped: string[] = []

  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (trimmed.length === 0) continue

    const index = trimmed.indexOf(INLINE_SEPARATOR)
    if (index === -1) {
      skipped.push(trimmed)
      continue
    }

    const front = trimmed.slice(0, index).trim()
    const back = trimmed.slice(index + INLINE_SEPARATOR.length).trim()
    if (front.length === 0 || back.length === 0) {
      skipped.push(trimmed)
      continue
    }

    cards.push({ front, back })
  }

  return { cards, skipped }
}

/**
 * Cada encabezado es una pregunta y lo que va hasta el siguiente encabezado es
 * la respuesta, sea cual sea el nivel. Sin anidamiento: un `###` debajo de un
 * `##` empieza una carta nueva, no se mete dentro de la anterior.
 */
function parseHeadings(text: string): ParseResult {
  const cards: ParsedCard[] = []
  const skipped: string[] = []

  let front: string | null = null
  let body: string[] = []

  const flush = () => {
    if (front === null) return
    const back = body.join('\n').trim()
    if (back.length === 0) skipped.push(front)
    else cards.push({ front, back })
    front = null
    body = []
  }

  for (const line of text.split('\n')) {
    const match = HEADING.exec(line)
    if (match) {
      flush()
      front = match[2].trim()
      continue
    }
    if (front !== null) body.push(line)
  }
  flush()

  return { cards, skipped }
}

function parseCsv(text: string): ParseResult {
  const delimiter = detectDelimiter(text) ?? ','
  const rows = parseDelimited(text, delimiter)
  const cards: ParsedCard[] = []
  const skipped: string[] = []

  const body = looksLikeHeader(rows[0]) ? rows.slice(1) : rows

  for (const row of body) {
    if (row.every((cell) => cell.trim().length === 0)) continue

    const [front = '', back = ''] = row
    if (front.trim().length === 0 || back.trim().length === 0) {
      skipped.push(row.join(delimiter))
      continue
    }

    // Solo las dos primeras columnas: las cartas no llevan etiquetas propias,
    // las etiquetas van en el mazo.
    cards.push({ front: front.trim(), back: back.trim() })
  }

  return { cards, skipped }
}

function detectDelimiter(text: string): string | undefined {
  const firstLine = text.split('\n').find((line) => line.trim().length > 0)
  if (!firstLine) return undefined

  // El que más aparece fuera de comillas gana.
  let best: { delimiter: string; count: number } | undefined
  for (const delimiter of DELIMITERS) {
    const count = parseDelimited(firstLine, delimiter)[0]?.length ?? 0
    if (count >= 2 && (!best || count > best.count)) best = { delimiter, count }
  }
  return best?.delimiter
}

function looksLikeHeader(row: string[] | undefined): boolean {
  if (!row || row.length < 2) return false
  return row.slice(0, 2).every((cell) => HEADER_WORDS.has(cell.trim().toLowerCase()))
}

/**
 * CSV de verdad: comillas dobles, comillas escapadas duplicándolas y saltos de
 * línea dentro de un campo entrecomillado. Media docena de líneas de más que
 * partir por comas, y evita que una respuesta con una coma rompa la importación.
 */
export function parseDelimited(text: string, delimiter: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let quoted = false

  const endField = () => {
    row.push(field)
    field = ''
  }
  const endRow = () => {
    endField()
    rows.push(row)
    row = []
  }

  for (let i = 0; i < text.length; i++) {
    const char = text[i]

    if (quoted) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          quoted = false
        }
      } else {
        field += char
      }
      continue
    }

    if (char === '"' && field.length === 0) {
      quoted = true
    } else if (char === delimiter) {
      endField()
    } else if (char === '\r') {
      // Se ignora: los finales de línea de Windows se tratan en el \n siguiente.
    } else if (char === '\n') {
      endRow()
    } else {
      field += char
    }
  }

  // La última fila solo cuenta si el fichero no terminaba en salto de línea.
  if (field.length > 0 || row.length > 0) endRow()

  return rows
}
