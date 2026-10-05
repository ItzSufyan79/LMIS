import { Card, SectionHead, Bar, Metric } from './ui'
import { fmt, pct } from '../utils/format'

function DemandTrend({ rows }) {
  const max = Math.max(...rows.map((r) => r.demand))
  return (
    <div className="mt-5">
      <p className="mb-2.5 text-[10px] font-medium tracking-[0.06em] text-ink-3 uppercase">Openings over time</p>
      <ul className="space-y-1.5">
        {rows.map((r) => (
          <li key={r.year} className="flex items-center gap-3">
            <span className="w-9 shrink-0 text-[11px] tabular-nums text-ink-3">{r.year}</span>
            <div className="flex-1">
              <Bar value={(r.demand / max) * 100} color="var(--demand)" height={5} />
            </div>
            <span className="w-14 shrink-0 text-right text-[11px] font-medium tabular-nums text-ink">
              {fmt(r.demand)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function DemandBlock({ intel }) {
  const { metrics, demandTrend } = intel
  return (
    <Card delay={180} className="overflow-hidden">
      <SectionHead title="Open roles" hint="What employers are hiring for" />
      <div className="px-5 pb-5">
        <div className="flex gap-8 pt-4">
          <Metric label="Open roles" value={fmt(metrics.demand)} sub="active openings" tone="demand" big />
          <Metric label="Hiring growth" value={pct(metrics.demandYoY)} sub="year on year" tone="demand" big />
        </div>
        <DemandTrend rows={demandTrend} />
      </div>
    </Card>
  )
}

export function SupplyFunnel({ intel }) {
  const { funnel } = intel
  const stages = funnel.stages
  const top = stages[0].value

  return (
    <Card delay={200} className="overflow-hidden">
      <SectionHead
        title="Why the talent pool is smaller"
        hint="Each filter removes candidates"
      />
      <div className="space-y-3 px-5 pb-5 pt-4">
        {stages.map((s, i) => {
          const prev = i === 0 ? null : stages[i - 1].value
          const drop = prev ? Math.round((1 - s.value / prev) * 100) : null
          const isLast = i === stages.length - 1
          return (
            <div key={s.label} className="relative">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[11.5px] text-ink">{s.label}</span>
                <span
                  className="text-[13px] font-semibold tabular-nums"
                  style={{ color: isLast ? 'var(--supply)' : 'var(--ink)' }}
                >
                  {fmt(s.value)}
                </span>
              </div>
              <div className="mt-1">
                <Bar value={(s.value / top) * 100} color={isLast ? 'var(--supply)' : 'var(--ink-3)'} height={4} />
              </div>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="text-[10.5px] text-ink-3">{s.note}</span>
                {drop !== null && <span className="text-[10.5px] tabular-nums text-ink-3">−{drop}%</span>}
              </div>
            </div>
          )
        })}

        <p className="border-t border-line-soft pt-3 text-[11.5px] leading-relaxed text-ink-2">
          Effective supply is{' '}
          <span className="font-semibold tabular-nums text-supply">{fmt(funnel.competencyMatched)}</span> —{' '}
          <span className="font-semibold tabular-nums text-ink">
            {((funnel.competencyMatched / funnel.totalTrained) * 100).toFixed(0)}%
          </span>{' '}
          of the trained pool survives every filter.
        </p>
      </div>
    </Card>
  )
}
