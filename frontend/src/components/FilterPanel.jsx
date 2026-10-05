import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { OCCUPATIONS, STATES } from '../data/catalog'
import { HORIZONS, PERIODS } from '../data/engine'
import { fmt, pctPlain } from '../utils/format'

const labelCls = 'mb-1.5 block text-[10px] font-medium tracking-[0.06em] text-ink-3 uppercase'

const selectCls =
  'w-full appearance-none border border-line bg-panel px-2.5 py-1.5 text-[12px] text-ink transition-colors duration-150 focus:border-accent focus:outline-none'

function Select({ label, value, onChange, children }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div className="relative">
        <select className={`${selectCls} pr-7`} value={value} onChange={(e) => onChange(e.target.value)}>
          {children}
        </select>
        <svg
          className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-ink-3"
          width="10"
          height="10"
          viewBox="0 0 12 12"
          aria-hidden
        >
          <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  )
}

export default function FilterPanel({ filters, onChange, onReset, districts, intel }) {
  const dist = intel?.distribution || []
  const total = dist.reduce((a, b) => a + b.value, 0)

  return (
    <aside className="flex w-full shrink-0 flex-col border-line bg-bg lg:w-[272px] lg:border-r">
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-line px-4">
        <h2 className="text-[11px] font-medium tracking-[0.06em] text-ink uppercase">Filters</h2>
        <button
          type="button"
          onClick={onReset}
          className="text-[10.5px] text-ink-3 transition-colors duration-150 hover:text-ink focus-visible:ring-1 focus-visible:ring-accent focus-visible:outline-none"
        >
          Reset
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 py-4">
        <Select
          label="State"
          value={filters.stateId}
          onChange={(v) => onChange({ stateId: v, districtId: '' })}
        >
          <option value="">All India</option>
          {STATES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>

        <Select label="District" value={filters.districtId} onChange={(v) => onChange({ districtId: v })}>
          <option value="">All districts</option>
          {districts.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </Select>

        <Select
          label="Trade"
          value={filters.occupationId}
          onChange={(v) => onChange({ occupationId: v })}
        >
          <option value="">Select a trade</option>
          {OCCUPATIONS.map((o) => (
            <option key={o.id} value={o.id}>
              {o.title}
            </option>
          ))}
        </Select>

        <Select label="Period" value={filters.periodId} onChange={(v) => onChange({ periodId: v })}>
          {PERIODS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </Select>

        <div>
          <span className={labelCls}>Forecast horizon</span>
          <div className="flex border border-line">
            {HORIZONS.map((h, i) => {
              const active = filters.horizon === h.id
              return (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => onChange({ horizon: h.id })}
                  aria-pressed={active}
                  className={`flex-1 py-1.5 text-[11.5px] font-medium transition-colors duration-150 focus-visible:ring-1 focus-visible:ring-accent focus-visible:outline-none ${
                    i > 0 ? 'border-l border-line' : ''
                  } ${active ? 'bg-accent-soft text-ink' : 'text-ink-3 hover:text-ink-2'}`}
                >
                  {h.id}M
                </button>
              )
            })}
          </div>
        </div>

        {intel && total > 0 && (
          <details className="border-t border-line-soft pt-3">
            <summary className="flex cursor-pointer list-none items-center justify-between text-[10px] font-medium tracking-[0.06em] text-ink-3 uppercase marker:hidden hover:text-ink-2">
              Talent mix
              <svg
                className="shrink-0 transition-transform duration-150 group-open:rotate-180"
                width="10"
                height="10"
                viewBox="0 0 12 12"
                aria-hidden
              >
                <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </summary>

            <div className="mt-3">
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                    <Pie
                      data={dist}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={44}
                      outerRadius={58}
                      paddingAngle={1}
                      stroke="none"
                      isAnimationActive={false}
                    >
                      {dist.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v, n) => [fmt(v), n]}
                      contentStyle={{
                        background: 'var(--panel-3)',
                        border: '1px solid var(--line)',
                        borderRadius: 4,
                        fontSize: 11,
                        color: 'var(--ink)',
                      }}
                      itemStyle={{ color: 'var(--ink)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <dl className="mt-3 space-y-1.5">
                {dist.map((d) => (
                  <div key={d.name} className="flex items-center gap-2 text-[11px]">
                    <span className="size-1.5 shrink-0" style={{ background: d.color }} aria-hidden />
                    <dt className="min-w-0 flex-1 truncate text-ink-2">{d.name}</dt>
                    <dd className="font-semibold tabular-nums text-ink">{pctPlain((d.value / total) * 100)}</dd>
                  </div>
                ))}
              </dl>

              <p className="mt-3 border-t border-line-soft pt-2.5 text-[10.5px] leading-relaxed text-ink-3">
                Composition of the local talent pool. The decision metric stays gap = open roles − talent
                pool.
              </p>
            </div>
          </details>
        )}
      </div>
    </aside>
  )
}