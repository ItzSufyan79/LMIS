const PERIOD_LABEL = {
  l3: 'L3',
  l6: 'L6',
  l12: 'L12',
}

const HORIZON_LABEL = { 3: '3M', 6: '6M', 12: '12M' }

function titleCase(id) {
  if (!id) return ''
  return id
    .split('-')
    .slice(1)
    .join(' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function HudTop({ view = 'map', onViewChange, filters = {} }) {
  const { stateId = '', districtId = '', periodId = 'l12', horizon = 12 } = filters

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-6 border-b border-line bg-bg px-5">
      <div className="flex min-w-0 items-baseline gap-4">
        <span className="shrink-0 text-[13px] font-semibold tracking-[-0.01em] text-ink">LMIS</span>
        <span className="hidden truncate text-[11px] text-ink-3 sm:inline">
          Labour Market Intelligence
        </span>
      </div>

      <div className="flex shrink-0 items-center gap-5">
        {stateId && (
          <p className="hidden truncate text-[11.5px] text-ink-2 md:max-w-[320px]">
            {stateId.replace(/^in-?/, '').toUpperCase()}
            {districtId && ` · ${titleCase(districtId)}`}
          </p>
        )}

        <p className="hidden text-[11px] text-ink-3 lg:block">
          {PERIOD_LABEL[periodId] || periodId.toUpperCase()} · {HORIZON_LABEL[horizon] || `${horizon}M`}
        </p>

        <nav className="flex border border-line" aria-label="View">
          {[
            ['map', 'Overview'],
            ['report', 'Report'],
          ].map(([id, label], i) => (
            <button
              key={id}
              type="button"
              onClick={() => onViewChange?.(id)}
              aria-current={view === id ? 'page' : undefined}
              className={`px-3 py-1.5 text-[11.5px] font-medium transition-colors duration-150 focus-visible:ring-1 focus-visible:ring-accent focus-visible:outline-none ${
                i > 0 ? 'border-l border-line' : ''
              } ${view === id ? 'bg-accent-soft text-ink' : 'text-ink-3 hover:text-ink-2'}`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}