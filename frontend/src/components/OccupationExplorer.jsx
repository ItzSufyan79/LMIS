import { useMemo, useState } from 'react'
import { OCCUPATIONS, SECTORS } from '../data/catalog'
import { buildIntelligence } from '../data/engine'
import { StatusPill } from './ui'
import { fmtCompact, signed } from '../utils/format'

const SHORT_SECTOR = {
  'Electrical & Construction': 'Electrical',
  'Tourism & Hospitality': 'Hospitality',
  'Logistics & Warehousing': 'Logistics',
}

export default function OccupationExplorer({ filters, onSelect }) {
  const [query, setQuery] = useState('')
  const [sector, setSector] = useState('All')

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return OCCUPATIONS.filter((o) => sector === 'All' || o.sector === sector)
      .filter(
        (o) =>
          !q ||
          o.title.toLowerCase().includes(q) ||
          o.nco.includes(q) ||
          o.sector.toLowerCase().includes(q),
      )
      .map((o) => {
        if (!filters.districtId) return { occ: o, metrics: null, status: null }
        const intel = buildIntelligence({
          occupationId: o.id,
          districtId: filters.districtId,
          periodId: filters.periodId,
          horizon: filters.horizon,
        })
        return { occ: o, metrics: intel.metrics, status: intel.status }
      })
  }, [query, sector, filters.districtId, filters.periodId, filters.horizon])

  return (
    <aside className="flex w-full shrink-0 flex-col border-line bg-bg lg:w-[288px] lg:border-l">
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-line px-4">
        <h2 className="text-[11px] font-medium tracking-[0.06em] text-ink uppercase">Trades</h2>
        <span className="text-[10.5px] tabular-nums text-ink-3">{rows.length}</span>
      </div>

      <div className="shrink-0 border-b border-line-soft px-4 py-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search trade or NCO"
          aria-label="Search trades"
          className="w-full border border-line bg-panel px-2.5 py-1.5 text-[12px] text-ink placeholder:text-ink-3 focus:border-accent focus:outline-none"
        />

        <div className="mt-2 flex gap-1 overflow-x-auto">
          {['All', ...SECTORS].map((s) => {
            const active = sector === s
            return (
              <button
                key={s}
                type="button"
                onClick={() => setSector(s)}
                aria-pressed={active}
                className={`shrink-0 border px-2 py-0.5 text-[10.5px] whitespace-nowrap transition-colors duration-150 focus-visible:ring-1 focus-visible:ring-accent focus-visible:outline-none ${
                  active
                    ? 'border-accent bg-accent-soft text-ink'
                    : 'border-line text-ink-3 hover:text-ink-2'
                }`}
              >
                {SHORT_SECTOR[s] || s}
              </button>
            )
          })}
        </div>
      </div>

      <ul className="min-h-0 flex-1 divide-y divide-line-soft overflow-y-auto">
        {rows.length === 0 && (
          <li className="px-4 py-6 text-center text-[11px] text-ink-3">No trade matches “{query}”.</li>
        )}
        {rows.map(({ occ, metrics, status }) => {
          const active = filters.occupationId === occ.id
          return (
            <li key={occ.id}>
              <button
                type="button"
                onClick={() => onSelect(occ.id)}
                aria-current={active ? 'true' : undefined}
                className={`w-full px-4 py-2.5 text-left transition-colors duration-150 hover:bg-panel-3 focus-visible:ring-1 focus-visible:ring-accent focus-visible:outline-none ${
                  active ? 'bg-accent-soft' : ''
                }`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 truncate text-[12px] text-ink">{occ.title}</span>
                  {metrics && (
                    <span
                      className="shrink-0 text-[12px] font-semibold tabular-nums"
                      style={{ color: metrics.gap > 0 ? 'var(--gap)' : 'var(--supply)' }}
                    >
                      {signed(metrics.gap)}
                    </span>
                  )}
                </div>

                {metrics ? (
                  <div className="mt-1 flex items-center gap-3 text-[10.5px] tabular-nums text-ink-3">
                    <span>NCO {occ.nco}</span>
                    <span>{fmtCompact(metrics.demand)} open</span>
                    <StatusPill status={status} size="sm" />
                  </div>
                ) : (
                  <p className="mt-1 text-[10.5px] text-ink-3">
                    {occ.sector} · NCO {occ.nco}
                  </p>
                )}
              </button>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}