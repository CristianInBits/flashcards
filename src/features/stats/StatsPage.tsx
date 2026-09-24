import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router'

import { loadStats } from '../../data/stats'
import { BOX_INTERVALS } from '../../domain/leitner'
import type { Box } from '../../domain/types'
import { ActivityChart } from './ActivityChart'

const RANGE_DAYS = 30
const BOXES: Box[] = [1, 2, 3, 4, 5]

export function StatsPage() {
  const stats = useLiveQuery(() => loadStats(RANGE_DAYS), [])

  if (!stats) {
    return (
      <section className="page">
        <h1 className="page__title">Estadísticas</h1>
        <p className="empty__hint">Cargando…</p>
      </section>
    )
  }

  if (stats.cards === 0) {
    return (
      <section className="page">
        <h1 className="page__title">Estadísticas</h1>
        <div className="empty">
          <p className="empty__text">Todavía no hay nada que contar.</p>
          <p className="empty__hint">Crea un mazo y repasa un rato.</p>
          <p>
            <Link className="button" to="/">
              Ir a mis mazos
            </Link>
          </p>
        </div>
      </section>
    )
  }

  const maxBox = Math.max(...BOXES.map((box) => stats.boxes[box]), 1)

  return (
    <section className="page">
      <h1 className="page__title">Estadísticas</h1>

      <div className="tiles">
        <Tile
          value={String(stats.streaks.current)}
          label={stats.streaks.current === 1 ? 'día seguido' : 'días seguidos'}
          highlight={stats.streaks.current > 0}
        />
        <Tile
          value={stats.accuracy === null ? '—' : `${Math.round(stats.accuracy * 100)}%`}
          label="aciertos"
        />
        <Tile value={String(stats.totalReviews)} label="repasos" />
      </div>

      {!stats.streaks.studiedToday && stats.streaks.current > 0 && (
        <div className="notice notice--warning">
          <p className="notice__text">
            Hoy todavía no has repasado. Tienes hasta medianoche para no romper la racha.
          </p>
        </div>
      )}

      <h2 className="page__title page__title--small">Últimos {RANGE_DAYS} días</h2>
      <ActivityChart daily={stats.daily} />
      <p className="hint">La parte rosa de cada barra son las cartas falladas.</p>

      <h2 className="page__title page__title--small">Reparto por cajas</h2>
      <ul className="boxes">
        {BOXES.map((box) => (
          <li key={box} className="boxes__row">
            <span className="boxes__label">
              Caja {box}
              <small>
                cada {BOX_INTERVALS[box]} {BOX_INTERVALS[box] === 1 ? 'día' : 'días'}
              </small>
            </span>
            <span className="boxes__track">
              <span
                className="boxes__fill"
                style={{ width: `${(stats.boxes[box] / maxBox) * 100}%` }}
              />
            </span>
            <span className="boxes__count">{stats.boxes[box]}</span>
          </li>
        ))}
      </ul>

      <dl className="rows">
        <div className="row">
          <dt className="row__label">Cartas en total</dt>
          <dd className="row__value">{stats.cards}</dd>
        </div>
        <div className="row">
          <dt className="row__label">Pendientes hoy</dt>
          <dd className="row__value">{stats.dueToday}</dd>
        </div>
        <div className="row">
          <dt className="row__label">Racha más larga</dt>
          <dd className="row__value">
            {stats.streaks.longest} {stats.streaks.longest === 1 ? 'día' : 'días'}
          </dd>
        </div>
      </dl>
    </section>
  )
}

function Tile({
  value,
  label,
  highlight,
}: {
  value: string
  label: string
  highlight?: boolean
}) {
  return (
    <div className={highlight ? 'tile tile--highlight' : 'tile'}>
      <span className="tile__value">{value}</span>
      <span className="tile__label">{label}</span>
    </div>
  )
}
