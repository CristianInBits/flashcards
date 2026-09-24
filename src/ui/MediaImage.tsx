import { useEffect, useState } from 'react'

import { getMedia } from '../data/media'
import { parseMediaUrl } from '../lib/media'

type Props = React.ImgHTMLAttributes<HTMLImageElement>

/**
 * Renderiza las imágenes de las cartas.
 *
 * Las que apuntan a `carti:<id>` se sacan de IndexedDB y se enseñan a través de
 * una URL de objeto, que se revoca al desmontar: si no, cada vez que pasas una
 * carta el navegador se queda con el blob en memoria hasta recargar.
 */
export function MediaImage({ src, alt, ...rest }: Props) {
  const mediaId = typeof src === 'string' ? parseMediaUrl(src) : null
  const [url, setUrl] = useState<string>()
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    if (!mediaId) return
    let cancelled = false
    let objectUrl: string | undefined

    void getMedia(mediaId).then((item) => {
      if (cancelled) return
      if (!item) {
        setMissing(true)
        return
      }
      objectUrl = URL.createObjectURL(item.blob)
      setUrl(objectUrl)
    })

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [mediaId])

  // Imagen externa: se deja pasar tal cual.
  if (!mediaId) return <img src={src} alt={alt ?? ''} {...rest} />

  if (missing) {
    return <span className="markdown__media markdown__media--missing">{alt || 'Imagen'} (no encontrada)</span>
  }

  if (!url) return <span className="markdown__media">{alt || 'Imagen'}…</span>

  return <img src={url} alt={alt ?? ''} {...rest} />
}
