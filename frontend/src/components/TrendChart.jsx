import { useMemo } from 'react'
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import { ChartLineUp as LineIcon } from '@phosphor-icons/react'
import { Card, SectionHead } from './ui'
import { fmt, fmtCompact } from '../utils/format'

const HISTORY_COUNT = 18

function TooltipContent({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const row = payload[0]?.payload
  return (
    <div className="min-w-[168px] border border-line bg-panel p-2.5">
      <p className="mb-1.5 flex items-center justify-between gap-3 border-b border-line-soft pb-1.5 text-[11px] text-ink">
        <span>{label}</span>
        <span
          className="text-[9.5px] tracking-[0.06em] uppercase"
          style={{ color: row.kind === 'forecast' ? 'var(--accent)' : 'var(--ink-3)' }}
        >
          {row.kind}
        </span>
      </p>
      <dl className="space-y-1 text-[11px] tabular-nums">
        <div className="flex justify-between gap-4">
          <dt className="text-demand">Open roles</dt>
          <dd className="font-semibold text-ink">{fmt(row.demand)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-supply">Job-ready talent</dt>
          <dd className="font-semibold text-ink">{fmt(row.supply)}</dd>
        </div>
        <div className="flex justify-between gap-4 border-t border-line-soft pt-1">
          <dt className="text-ink-3">Talent gap</dt>
          <dd className="font-semibold" style={{ color: row.gap > 0 ? 'var(--gap)' : 'var(--supply)' }}>
            {row.gap > 0 ? '+' : '−'}
            {fmt(Math.abs(row.gap))}
          </dd>
        </div>
        {row.kind === 'forecast' && (
          <div className="flex justify-between gap-4 text-[10px] text-ink-3">
            <dt>95% band</dt>
            <dd>
              {fmtCompact(row.demandLow)}–{fmtCompact(row.demandHigh)}
            </dd>
          </div>
        )}
      </dl>
    </div>
  )
}

export default function TrendChart({ intel }) {
  const data = useMemo(
    () =>
      intel.series.map((r) => ({
        ...r,
        dLow: r.demandLow,
        dBand: Math.max(r.demandHigh - r.demandLow, 0),
        sLow: r.supplyLow,
        sBand: Math.max(r.supplyHigh - r.supplyLow, 0),
      })),
    [intel.series],
  )

  const dividerLabel = data[HISTORY_COUNT - 1]?.label

  return (
    <Card delay={100}>
      <SectionHead
        icon={LineIcon}
        title="Open roles vs available talent"
        hint={`${data.length} months · shading is the forecast band`}
      />
      <div className="h-[300px] px-2 py-4 sm:px-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 12, bottom: 4, left: 0 }}>
            <CartesianGrid stroke="var(--line-soft)" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: 'var(--ink-3)', fontSize: 10 }}
              tickLine={false}
              axisLine={{ stroke: 'var(--line-soft)' }}
              interval={4}
              minTickGap={16}
            />
            <YAxis
              tick={{ fill: 'var(--ink-3)', fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              width={46}
              domain={[0, (dataMax) => Math.ceil((dataMax || 0) * 1.25 / 500) * 500]}
              tickFormatter={(v) => fmtCompact(v)}
            />
            <Tooltip content={<TooltipContent />} cursor={{ stroke: 'var(--line)' }} />
            <Legend
              iconType="plainline"
              iconSize={14}
              wrapperStyle={{ fontSize: 11, color: 'var(--ink-2)', paddingTop: 10 }}
              formatter={(value) => <span style={{ color: 'var(--ink-2)' }}>{value}</span>}
            />

            <Area dataKey="supply" stackId="g" stroke="none" fill="none" isAnimationActive={false} legendType="none" />
            <Area
              dataKey="gap"
              stackId="g"
              stroke="none"
              fill="var(--gap)"
              fillOpacity={0.09}
              isAnimationActive={false}
              legendType="none"
            />

            <Area
              dataKey="dLow"
              stackId="d"
              stroke="none"
              fill="none"
              isAnimationActive={false}
              legendType="none"
            />
            <Area
              dataKey="dBand"
              stackId="d"
              stroke="none"
              fill="var(--demand)"
              fillOpacity={0.08}
              isAnimationActive={false}
              legendType="none"
            />
            <Area
              dataKey="sLow"
              stackId="s"
              stroke="none"
              fill="none"
              isAnimationActive={false}
              legendType="none"
            />
            <Area
              dataKey="sBand"
              stackId="s"
              stroke="none"
              fill="var(--supply)"
              fillOpacity={0.08}
              isAnimationActive={false}
              legendType="none"
            />

            <Line
              type="monotone"
              dataKey="demand"
              name="Open roles"
              stroke="var(--demand)"
              strokeWidth={1.75}
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0 }}
              animationDuration={700}
              animationEasing="ease-out"
            />
            <Line
              type="monotone"
              dataKey="supply"
              name="Job-ready talent"
              stroke="var(--supply)"
              strokeWidth={1.75}
              dot={false}
              activeDot={{ r: 3, strokeWidth: 0 }}
              animationDuration={700}
              animationEasing="ease-out"
            />

            <ReferenceLine
              x={dividerLabel}
              stroke="var(--line)"
              strokeDasharray="2 3"
              label={{
                value: 'Forecast',
                position: 'insideTopRight',
                fill: 'var(--ink-3)',
                fontSize: 9.5,
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
