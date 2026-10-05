import { signed } from '../utils/format'

export default function EarlyWarning({ intel }) {
  const { alert, metrics, district, state, occupation, status } = intel
  const tone =
    status === 'shortage'
      ? 'var(--shortage)'
      : status === 'oversupply'
        ? 'var(--oversupply)'
        : 'var(--supply)'

  const rows = [
    { label: 'Talent gap', value: signed(metrics.gap) },
    { label: 'Talent gap · 12M', value: signed(metrics.forecastGap12) },
    {
      label: 'Trend',
      value:
        metrics.forecastGap12 > metrics.gap ? 'Increasing' : metrics.forecastGap12 < metrics.gap ? 'Narrowing' : 'Flat',
    },
    { label: 'Severity', value: alert.severity },
  ]

  return (
    <section className="border-l-2 pl-4" style={{ borderColor: tone }}>
      <p className="text-[10px] font-medium tracking-[0.08em] uppercase" style={{ color: tone }}>
        Early warning · {alert.kind}
      </p>
      <p className="mt-1.5 max-w-[70ch] text-[15px] leading-snug font-medium text-ink">{alert.headline}</p>
      <p className="mt-1 max-w-[76ch] text-[12.5px] leading-relaxed text-ink-2">{alert.detail}</p>

      <dl className="mt-4 flex flex-wrap gap-x-10 gap-y-3">
        {rows.map((r) => (
          <div key={r.label}>
            <dt className="text-[9.5px] font-medium tracking-[0.06em] text-ink-3 uppercase">{r.label}</dt>
            <dd className="mt-0.5 text-[14px] font-semibold tabular-nums text-ink">{r.value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-4 text-[10.5px] text-ink-3">
        {district.name}, {state.name} · {occupation.title}
      </p>
    </section>
  )
}