import { lazy, Suspense } from 'react'

const MarkdownContent = lazy(() => import('./MarkdownContent'))

/**
 * Renderiza Markdown con fórmulas LaTeX y bloques de código.
 *
 * El renderizador va en un chunk aparte: la lista de mazos no tiene por qué
 * descargar KaTeX. Mientras llega se muestra el texto en crudo, que para una
 * carta sencilla es prácticamente lo mismo y evita que la pantalla parpadee.
 */
export function Markdown({ children, className }: { children: string; className?: string }) {
  return (
    <div className={className ? `markdown ${className}` : 'markdown'}>
      <Suspense fallback={<p className="markdown__raw">{children}</p>}>
        <MarkdownContent>{children}</MarkdownContent>
      </Suspense>
    </div>
  )
}
