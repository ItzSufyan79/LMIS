import { ArrowLeft } from '@phosphor-icons/react'
import { StatusPill } from './ui'

export default function ReportHeader({ intel, onBack }) {
  const { occupation, district, state, period, horizon, status, severity } = intel

  return (
    <header className="border-b border-line pb-5">
      <button
        type="button"
        onClick={onBack}
        className="mb-3 inline-flex items-center gap-1.5 text-[11.5px] text-ink-3 transition-colors duration-150 hover:text-ink focus-visible:ring-1 focus-visible:ring-accent focus-visible:outline-none"
      >
        <ArrowLeft size={11} /> Overview
      </button>

      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div className="min-w-0">
          <h1 className="text-[26px] leading-[1.15] font-medium tracking-[-0.02em] text-ink sm:text-[32px]">
            {occupation.title}
          </h1>
          <p className="mt-2 text-[12.5px] text-ink-2">
            {district.name}, {state.name}
            <span className="px-1.5 text-ink-3">·</span>
            {occupation.sector}
            <span className="px-1.5 text-ink-3">·</span>
            NCO {occupation.nco}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
          <StatusPill status={status} />
          <p className="text-[11px] text-ink-3">
            Severity {severity} · {period.label} · {horizon}M horizon
          </p>
        </div>
      </div>

      <p className="mt-4 max-w-[76ch] text-[13px] leading-relaxed text-ink-2">{intel.summary}</p>
    </header>
  )
}