import { Card, SectionHead, StatusPill } from './ui'
import { GAP_THRESHOLD } from '../data/engine'

const TONE = { warn: 'var(--shortage)', ok: 'var(--supply)', info: 'var(--accent)' }

export default function HiringActions({ intel }) {
  const { hiringActions, status, metrics, thresholdRule } = intel

  return (
    <Card delay={280} className="overflow-hidden">
      <SectionHead
        title="What to do about it"
        hint="Each action names the metric that produced it"
        action={<StatusPill status={status} size="sm" />}
      />

      <ol className="divide-y divide-line-soft">
        {hiringActions.map((o, i) => {
          const color = TONE[o.tone]
          return (
            <li key={o.action} className="flex gap-4 px-5 py-3.5">
              <span className="mt-0.5 shrink-0 text-[11px] tabular-nums" style={{ color }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <p className="text-[12.5px] font-medium text-ink">{o.action}</p>
                <p className="mt-1 text-[11.5px] leading-relaxed text-ink-2">
                  <span className="font-medium" style={{ color }}>
                    Why:
                  </span>{' '}
                  {o.why}
                </p>
              </div>
            </li>
          )
        })}
      </ol>

      <p className="border-t border-line-soft px-5 py-3 text-[11px] leading-relaxed text-ink-3">
        Verdict rule — <span className="text-ink-2">{thresholdRule}</span>. Here the ratio is{' '}
        <span className="tabular-nums text-ink-2">{(metrics.gapRatio * 100).toFixed(1)}%</span> against a ±
        {(GAP_THRESHOLD * 100).toFixed(0)}% band.
      </p>
    </Card>
  )
}