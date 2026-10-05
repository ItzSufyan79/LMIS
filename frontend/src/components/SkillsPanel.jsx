import { Card, SectionHead, Chip, Bar } from './ui'
import { fmt } from '../utils/format'
import { useLang } from '../i18n'

export default function SkillsPanel({ intel }) {
  const { t } = useLang()
  const { occupation, funnel } = intel

  const standards = [
    { label: t('sec.data.ncoCode'), value: occupation.nco },
    { label: t('sec.data.qp'), value: occupation.qp },
    { label: t('sec.data.nos'), value: occupation.nos.join(' · ') },
    { label: t('sec.data.nsqf'), value: `${t('sec.skills.level')} ${occupation.nsqf}` },
  ]

  return (
    <Card delay={220} className="overflow-hidden" collapsible defaultCollapsed>
      <SectionHead title={t('sec.skills.title')} hint={t('sec.skills.hint')} />

      <div className="grid gap-x-10 gap-y-8 px-5 py-5 lg:grid-cols-2">
        <div>
          <p className="mb-3 text-[10px] font-medium tracking-[0.06em] text-ink-3 uppercase">Screen for</p>
          <ul className="space-y-2.5">
            {occupation.skills.map((s) => (
              <li key={s.name}>
                <div className="mb-1 flex items-baseline justify-between gap-3">
                  <span className="text-[11.5px] text-ink-2">{s.name}</span>
                  <span className="text-[11px] font-medium tabular-nums text-ink">{s.weight}%</span>
                </div>
                <Bar value={s.weight} color="var(--ink-3)" height={4} />
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-6">
          <dl className="divide-y divide-line-soft border-y border-line-soft">
            {standards.map((f) => (
              <div key={f.label} className="flex items-baseline justify-between gap-4 py-2">
                <dt className="text-[10.5px] tracking-[0.04em] text-ink-3 uppercase">{f.label}</dt>
                <dd className="text-[11.5px] break-words text-ink">{f.value}</dd>
              </div>
            ))}
          </dl>

          <div>
            <p className="mb-2 text-[10px] font-medium tracking-[0.06em] text-ink-3 uppercase">
              {t('sec.skills.qualifications')}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {occupation.qualifications.map((q) => (
                <Chip key={q}>{q}</Chip>
              ))}
            </div>
          </div>

          <div className="border-t border-line-soft pt-3">
            <p className="text-[10px] font-medium tracking-[0.06em] text-ink-3 uppercase">Job-ready pool</p>
            <p className="mt-1 text-[22px] leading-none font-semibold tabular-nums text-supply">
              {fmt(funnel.competencyMatched)}
            </p>
            <p className="mt-1.5 text-[11px] text-ink-3">
              {t('sec.skills.jobReadyPool')} · {t('sec.data.nsqf')} {occupation.nsqf} · {intel.district.name}
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}