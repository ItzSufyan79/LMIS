import { Card, SectionHead, Bar, Metric } from './ui'
import { fmt } from '../utils/format'

export default function TrainingCapacity({ intel }) {
  const { seats, funnel, metrics, capacityTrend } = intel
  const supply = metrics.supply
  const max = Math.max(...capacityTrend.map((r) => r.seats), 1)
  const trained = funnel.occupationMatched

  return (
    <Card delay={260} className="overflow-hidden">
      <SectionHead title="Talent pipeline" hint="Where the next batch of candidates comes from" />
      <div className="px-5 pb-5">
        <div className="flex flex-wrap gap-x-8 gap-y-4 pt-4">
          <Metric label="Intake / year" value={fmt(seats)} sub="local training capacity" tone="ink" />
          <Metric label="Certified here" value={fmt(trained)} sub="trained in this trade" tone="ink" />
          <Metric label="Job-ready now" value={fmt(supply)} sub="usable pool" tone="supply" />
        </div>

        <div className="mt-5">
          <p className="mb-2.5 text-[10px] font-medium tracking-[0.06em] text-ink-3 uppercase">Pipeline growth</p>
          <ul className="space-y-1.5">
            {capacityTrend.map((r) => (
              <li key={r.year} className="flex items-center gap-3">
                <span className="w-9 shrink-0 text-[11px] tabular-nums text-ink-3">{r.year}</span>
                <div className="flex-1">
                  <Bar value={(r.seats / max) * 100} color="var(--ink-3)" height={5} />
                </div>
                <span className="w-14 shrink-0 text-right text-[11px] font-medium tabular-nums text-ink">
                  {fmt(r.seats)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-4 border-t border-line-soft pt-3 text-[11.5px] text-ink-2">
          Seats cover{' '}
          <span className="font-semibold tabular-nums text-ink">
            {((seats / metrics.demand) * 100).toFixed(0)}%
          </span>{' '}
          of current openings in {intel.district.name}.
        </p>
      </div>
    </Card>
  )
}
