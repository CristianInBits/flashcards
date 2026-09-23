import type { Element, Root } from 'hast'
import { createLowlight } from 'lowlight'
import { visit } from 'unist-util-visit'

import bash from 'highlight.js/lib/languages/bash'
import css from 'highlight.js/lib/languages/css'
import java from 'highlight.js/lib/languages/java'
import javascript from 'highlight.js/lib/languages/javascript'
import json from 'highlight.js/lib/languages/json'
import python from 'highlight.js/lib/languages/python'
import sql from 'highlight.js/lib/languages/sql'
import typescript from 'highlight.js/lib/languages/typescript'
import xml from 'highlight.js/lib/languages/xml'

/**
 * Resaltado de código con solo los lenguajes que usamos.
 *
 * No se usa `rehype-highlight` porque importa estáticamente el paquete «common»
 * de highlight.js —unas 38 gramáticas, cientos de kilobytes— y su opción
 * `languages` no evita que acaben en el bundle. Esto hace lo mismo pesando lo
 * que pesan los nueve lenguajes de abajo.
 *
 * Añadir un lenguaje es importarlo y meterlo en este objeto.
 */
const lowlight = createLowlight({
  bash,
  css,
  java,
  javascript,
  json,
  python,
  sql,
  typescript,
  xml,
})

const PREFIX = 'language-'

function languageOf(node: Element): string | undefined {
  const className = node.properties?.className
  if (!Array.isArray(className)) return undefined
  const match = className.map(String).find((name) => name.startsWith(PREFIX))
  return match?.slice(PREFIX.length)
}

function textOf(node: Element): string {
  return node.children
    .map((child) => (child.type === 'text' ? child.value : ''))
    .join('')
}

/**
 * Resalta los bloques ```lenguaje. Los que no declaran lenguaje, o declaran uno
 * que no está registrado, se dejan en texto plano: adivinarlo acierta poco y
 * colorea mal.
 */
export function rehypeHighlightLite() {
  return (tree: Root) => {
    visit(tree, 'element', (node: Element, _index, parent) => {
      if (node.tagName !== 'code') return
      if (!parent || parent.type !== 'element' || parent.tagName !== 'pre') return

      const language = languageOf(node)
      if (!language || !lowlight.registered(language)) return

      const highlighted = lowlight.highlight(language, textOf(node))
      node.children = highlighted.children as Element['children']
      node.properties = {
        ...node.properties,
        className: [...(node.properties?.className as string[]), 'hljs'],
      }
    })
  }
}
