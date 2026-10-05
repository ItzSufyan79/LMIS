import { Card, SectionHead, Chip, Bar } from './ui'
import { fmt } from '../utils/format'

export default function SkillsPanel({ intel }) {
  const { occupation, funnel } = intel

  const standards = [
    { label: 'NCO code', value: occupation.nco },
    { label: 'QP', value: occupation.qp },
    { label: 'NOS', value: occupation.nos.join(' · ') },
    { label: 'NSQF level', value: `Level ${occupation.nsqf}` },
  ]

  return (
    <Card delay={220} className="overflow-hidden" collapsible defaultCollapsed>
      <SectionHead title="What to screen for" hint="Competencies, standards and qualifications" />

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
              Accepted qualifications
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
              candidates assessed job-ready at NSQF level {occupation.nsqf} in {intel.district.name}
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}