import ReactMarkdown, { defaultUrlTransform, type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

import { parseMediaUrl } from '../lib/media'
import { MediaImage } from './MediaImage'
import { rehypeHighlightLite } from './rehypeHighlightLite'

import 'katex/dist/katex.min.css'

/**
 * Este módulo es pesado (KaTeX sobre todo), por eso se carga por separado desde
 * Markdown.tsx y no entra en el bundle inicial.
 */
const REMARK_PLUGINS = [remarkGfm, remarkMath]
const REHYPE_PLUGINS = [rehypeKatex, rehypeHighlightLite]

// Las imágenes de las cartas viven en IndexedDB, no en una URL.
const COMPONENTS: Components = { img: MediaImage }

/**
 * react-markdown vacía por seguridad cualquier URL cuyo esquema no conozca, y
 * `carti:` es uno de ellos: sin esto las imágenes de las cartas llegan con el
 * src en blanco. Solo se deja pasar una referencia nuestra bien formada; todo
 * lo demás sigue pasando por el saneado de la librería.
 */
function urlTransform(url: string): string {
  return parseMediaUrl(url) ? url : defaultUrlTransform(url)
}

export default function MarkdownContent({ children }: { children: string }) {
  return (
    // Sin rehype-raw: el HTML en bruto no se renderiza, se escapa.
    <ReactMarkdown
      remarkPlugins={REMARK_PLUGINS}
      rehypePlugins={REHYPE_PLUGINS}
      components={COMPONENTS}
      urlTransform={urlTransform}
    >
      {children}
    </ReactMarkdown>
  )
}
