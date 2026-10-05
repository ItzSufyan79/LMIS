import { Card, SectionHead } from './ui'
import { useLang } from '../i18n'

export default function GapReasons({ intel }) {
  const { t } = useLang()
  return (
    <Card delay={240} className="overflow-hidden">
      <SectionHead title={t('sec.reasons.title')} hint={t('sec.reasons.hint')} />
      <ul className="divide-y divide-line-soft">
        {intel.reasons.map((r, i) => (
          <li key={r.title} className="flex gap-4 px-5 py-3.5">
            <span className="mt-0.5 shrink-0 text-[11px] tabular-nums text-ink-3">
              {String(i + 1).padStart(2, '0')}
            </span>
            <div className="min-w-0">
              <p className="text-[12.5px] font-medium text-ink">{r.title}</p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-ink-2">{r.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  )
}