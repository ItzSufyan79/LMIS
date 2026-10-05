import { lazy, Suspense, useMemo, useState } from 'react'
const LabourMap = lazy(() => import('../maps/LabourMap'))
import { buildDistrictRows } from '../data/engine'
import { OCCUPATIONS } from '../data/catalog'
import { fmtCompact, signed } from '../utils/format'
import ResizableTrailing from '../components/ResizableTrailing'

export default function MapViewDraggable({
  filters,
  national,
  theme,
  onSelectState,
  onSelectDistrict,
  rankingOpen,
  onToggleRanking,
}) {
  const stateSelected = Boolean(filters.stateId)
  const [showHow, setShowHow] = useState(false)

  const rows = useMemo(() => {
    const occupationId = filters.occupationId || OCCUPATIONS[0].id
    if (stateSelected) {
      return buildDistrictRows(occupationId, filters.stateId).map((r) => ({
        id: r.districtId,
        label: r.name,
        gap: r.gap,
        demand: r.demand,
        supply: r.supply,
        status: r.status,
        active: filters.districtId === r.districtId,
        onClick: () => onSelectDistrict(r.districtId),
      }))
    }
    return national.map((r) => ({
      id: r.stateId,
      label: r.name,
      gap: r.gap,
      demand: r.demand,
      supply: r.supply,
      status: r.status,
      active: filters.stateId === r.stateId,
      onClick: () => onSelectState(r.stateId),
    }))
  }, [stateSelected, national, filters, onSelectDistrict, onSelectState])

  const maxGap = Math.max(...rows.map((r) => Math.abs(r.gap)), 1)

  const rightSidebar = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-line px-4">
        <h2 className="text-[11px] font-medium tracking-[0.06em] text-ink uppercase">
          {stateSelected ? 'Districts' : 'States'}
        </h2>
        <span className="text-[10.5px] tabular-nums text-ink-3">by gap</span>
      </div>

      <ul className="min-h-0 flex-1 divide-y divide-line-soft overflow-y-auto">
        {rows.map((r) => (
          <li key={r.id}>
            <button
              type="button"
              onClick={r.onClick}
              aria-current={r.active ? 'true' : undefined}
              className={`w-full px-4 py-2 text-left transition-colors duration-150 hover:bg-panel-3 focus-visible:ring-1 focus-visible:ring-accent focus-visible:outline-none ${
                r.active ? 'bg-accent-soft' : ''
              }`}
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="min-w-0 truncate text-[12px] text-ink">{r.label}</span>
                <span
                  className="shrink-0 text-[12px] font-semibold tabular-nums"
                  style={{ color: r.gap > 0 ? 'var(--gap)' : 'var(--supply)' }}
                >
                  {signed(r.gap)}
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-2.5">
                <div className="h-1 flex-1 bg-panel-3">
                  <div
                    className="h-full transition-[width] duration-500 ease-out"
                    style={{
                      width: `${(Math.abs(r.gap) / maxGap) * 100}%`,
                      background: r.gap > 0 ? 'var(--gap)' : 'var(--supply)',
                    }}
                  />
                </div>
                <span className="shrink-0 text-[9.5px] tabular-nums text-ink-3">
                  {fmtCompact(r.demand)} / {fmtCompact(r.supply)}
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>

      <details className="shrink-0 border-t border-line" onToggle={(e) => setShowHow(e.currentTarget.open)}>
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-[11px] font-medium tracking-[0.06em] text-ink-3 uppercase marker:hidden hover:text-ink-2">
          How to read this
          <svg
            className={`shrink-0 transition-transform duration-150 ${showHow ? 'rotate-180' : ''}`}
            width="10"
            height="10"
            viewBox="0 0 12 12"
            aria-hidden
          >
            <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </summary>
        {showHow && (
          <ol className="space-y-1.5 px-4 pb-4 text-[11px] leading-relaxed text-ink-2">
            <li>1 · Pick a state to drill into its districts.</li>
            <li>2 · Pick a district, then a trade.</li>
            <li>3 · The hiring brief opens automatically.</li>
          </ol>
        )}
      </details>
    </div>
  )

  const leftMap = (
    <div className="h-full min-h-[52vh] w-full p-0 md:p-4">
      <Suspense
        fallback={
          <div className="grid h-full min-h-[52vh] place-items-center rounded border border-line bg-panel">
            <span className="text-[11px] text-ink-3">Loading map…</span>
          </div>
        }
      >
        <LabourMap
          occupationId={filters.occupationId || OCCUPATIONS[0].id}
          national={national}
          selectedStateId={filters.stateId}
          selectedDistrictId={filters.districtId}
          onSelectState={onSelectState}
          onSelectDistrict={onSelectDistrict}
          theme={theme}
        />
      </Suspense>
    </div>
  )

  return (
    <div className="flex h-full min-h-0 w-full flex-col md:flex-row">
      <div className="flex min-h-0 flex-1 overflow-hidden">{leftMap}</div>
      <ResizableTrailing
        label="Districts"
        minWidth={240}
        maxWidth={420}
        defaultWidth={300}
        collapsed={!rankingOpen}
        onToggleCollapsed={onToggleRanking}
      >
        {rightSidebar}
      </ResizableTrailing>
    </div>
  )
}
