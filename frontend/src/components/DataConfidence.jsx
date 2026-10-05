import { Chip } from './ui'

export default function DataConfidence({ intel }) {
  const dq = intel.dataQuality

  const items = [
    { label: 'Updated', value: dq.updatedOn.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
    { label: 'Records', value: `${dq.records.toFixed(1)}M` },
    { label: 'Mapped', value: `${dq.mappingPct.toFixed(1)}%` },
    { label: 'Missing', value: `${dq.missingPct.toFixed(1)}%` },
    { label: 'Model', value: dq.model },
    { label: 'MAE', value: dq.mae.toLocaleString('en-IN') },
    { label: 'RMSE', value: dq.rmse.toLocaleString('en-IN') },
    { label: 'MAPE', value: `${dq.mape.toFixed(1)}%` },
  ]

  return (
    <details className="border-t border-line pt-4">
      <summary className="flex cursor-pointer list-none items-center justify-between text-[11px] font-medium tracking-[0.06em] text-ink-3 uppercase marker:hidden hover:text-ink-2 focus-visible:ring-1 focus-visible:ring-accent focus-visible:outline-none">
        Data &amp; model
        <svg
          className="shrink-0 transition-transform duration-150 open:rotate-180"
          width="10"
          height="10"
          viewBox="0 0 12 12"
          aria-hidden
        >
          <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </summary>

      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4 lg:grid-cols-8">
        {items.map((it) => (
          <div key={it.label} className="min-w-0">
            <dt className="text-[9.5px] font-medium tracking-[0.06em] text-ink-3 uppercase">{it.label}</dt>
            <dd className="mt-0.5 text-[11.5px] leading-tight break-words text-ink-2">{it.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-line-soft pt-3">
        <span className="text-[10px] text-ink-3">Sources</span>
        {dq.sources.map((s) => (
          <Chip key={s}>{s}</Chip>
        ))}
        <span className="ml-auto text-[10px] text-ink-3">Prototype dataset — figures are illustrative.</span>
      </div>
    </details>
  )
}