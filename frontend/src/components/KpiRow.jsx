import { fmtCompact } from '../utils/format'
import CountUp from './CountUp'

function Tile({ label, children, tone = 'ink', foot }) {
  const colors = {
    demand: 'var(--demand)',
    supply: 'var(--supply)',
    gap: 'var(--gap)',
    accent: 'var(--accent)',
    ink: 'var(--ink)',
  }
  return (
    <div className="flex min-w-0 flex-col justify-between border-l border-line pl-3 first:border-l-0 first:pl-0">
      <p className="truncate text-[10px] font-medium tracking-[0.06em] text-ink-3 uppercase">{label}</p>
      <p
        className="mt-1.5 text-[26px] leading-none font-semibold tabular-nums tracking-[-0.01em]"
        style={{ color: colors[tone] }}
      >
        {children}
      </p>
      {foot && <p className="mt-1.5 text-[10.5px] text-ink-3">{foot}</p>}
    </div>
  )
}

export default function KpiRow({ intel }) {
  const { metrics, status } = intel
  const gapTone = metrics.gap > 0 ? 'gap' : 'supply'

  return (
    <section>
      <div className="grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-3 lg:grid-cols-6">
        <Tile label="Open roles" tone="demand">
          <CountUp value={metrics.demand} />
        </Tile>
        <Tile label="Talent pool" tone="supply">
          <CountUp value={metrics.supply} />
        </Tile>
        <Tile label="Gap" tone={gapTone} foot={`${(Math.abs(metrics.gapRatio) * 100).toFixed(1)}% of demand`}>
          {metrics.gap > 0 ? '+' : '−'}
          <CountUp value={Math.abs(metrics.gap)} />
        </Tile>
        <Tile label="Open roles · 12M" tone="demand">
          <CountUp value={metrics.forecastDemand} format={fmtCompact} />
        </Tile>
        <Tile label="Talent pool · 12M" tone="supply">
          <CountUp value={metrics.forecastSupply} format={fmtCompact} />
        </Tile>
        <Tile
          label="Gap · 12M"
          tone={metrics.forecastGap12 > 0 ? 'gap' : 'supply'}
          foot={status === 'shortage' ? 'widening' : status === 'oversupply' ? 'deepening' : 'stable'}
        >
          {metrics.forecastGap12 > 0 ? '+' : '−'}
          <CountUp value={Math.abs(metrics.forecastGap12)} format={fmtCompact} />
        </Tile>
      </div>
      <p className="mt-4 text-[10.5px] text-ink-3">
        Current period and 12-month forecast. Gap = open roles − talent pool.
      </p>
    </section>
  )
}