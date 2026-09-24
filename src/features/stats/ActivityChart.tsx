import type { DailyCount } from '../../domain/stats'
import { fromIsoDate } from '../../lib/date'

/** Coordenadas internas del SVG; el tamaño real lo pone el CSS. */
const WIDTH = 300
const HEIGHT = 90
const GAP = 1

/**
 * Barras de repasos por día. SVG a mano en vez de una librería de gráficas:
 * son treinta rectángulos y una librería pesaría más que toda la pantalla.
 */
export function ActivityChart({ daily }: { daily: DailyCount[] }) {
  const max = Math.max(...daily.map((day) => day.reviews), 1)
  const slot = WIDTH / daily.length
  const barWidth = Math.max(slot - GAP, 1)

  const total = daily.reduce((sum, day) => sum + day.reviews, 0)
  const first = daily[0]
  const last = daily[daily.length - 1]

  return (
    <figure className="chart">
      <svg
        className="chart__svg"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`${total} repasos en los últimos ${daily.length} días`}
      >
        {daily.map((day, index) => {
          // Un día con repasos siempre se ve, aunque sea uno solo.
          const height = day.reviews === 0 ? 0 : Math.max((day.reviews / max) * HEIGHT, 3)
          // Los dos tramos se apilan, no se superponen: pintar el fallado encima
          // del acierto con el mismo color no se distingue de no pintarlo.
          const correctHeight = day.reviews === 0 ? 0 : (day.correct / day.reviews) * height
          const failedHeight = height - correctHeight

          return (
            <g key={day.date}>
              {failedHeight > 0 && (
                <rect
                  x={index * slot}
                  y={HEIGHT - height}
                  width={barWidth}
                  height={failedHeight}
                  className="chart__bar chart__bar--failed"
                />
              )}
              {correctHeight > 0 && (
                <rect
                  x={index * slot}
                  y={HEIGHT - correctHeight}
                  width={barWidth}
                  height={correctHeight}
                  className="chart__bar"
                />
              )}
            </g>
          )
        })}
      </svg>

      <figcaption className="chart__axis">
        <span>{formatShort(first.date)}</span>
        <span>
          máximo {max} {max === 1 ? 'repaso' : 'repasos'}
        </span>
        <span>{formatShort(last.date)}</span>
      </figcaption>
    </figure>
  )
}

function formatShort(date: string): string {
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(
    fromIsoDate(date),
  )
}
