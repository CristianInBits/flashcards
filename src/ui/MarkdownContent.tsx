import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

import { rehypeHighlightLite } from './rehypeHighlightLite'

import 'katex/dist/katex.min.css'

/**
 * Este módulo es pesado (KaTeX sobre todo), por eso se carga por separado desde
 * Markdown.tsx y no entra en el bundle inicial.
 */
const REMARK_PLUGINS = [remarkGfm, remarkMath]
const REHYPE_PLUGINS = [rehypeKatex, rehypeHighlightLite]

export default function MarkdownContent({ children }: { children: string }) {
  return (
    // Sin rehype-raw: el HTML en bruto no se renderiza, se escapa.
    <ReactMarkdown remarkPlugins={REMARK_PLUGINS} rehypePlugins={REHYPE_PLUGINS}>
      {children}
    </ReactMarkdown>
  )
}
