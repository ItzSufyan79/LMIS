import { lazy, Suspense, useMemo, useState } from 'react'
const LabourMap = lazy(() => import('../maps/LabourMap'))
import { buildDistrictRows, buildNationalOverview, buildTradeRanking } from '../data/engine'
import { OCCUPATIONS, findState } from '../data/catalog'
import { StatusPill } from '../components/ui'
import { signed } from '../utils/format'
import ResizableTrailing from '../components/ResizableTrailing'
import Breadcrumb from '../components/Breadcrumb'
import { useLang } from '../i18n'

function SeverityScore({ value }) {
  return (
    <span className="flex items-center gap-2">
      <span className="h-1 w-12 shrink-0 bg-panel-3">
        <span className="block h-full bg-ink-3" style={{ width: `${Math.max(2, Math.min(100, value))}%` }} />
      </span>
      <span className="w-6 shrink-0 text-right text-[12px] font-semibold tabular-nums text-ink">{value}</span>
    </span>
  )
}

export default function MapViewDraggable({
  filters,
  national,
  theme,
  onSelectState,
  onSelectDistrict,
  onSelectOccupation,
  rankingOpen,
  onToggleRanking,
}) {
  const { t } = useLang()
  const [showHow, setShowHow] = useState(false)

  const occupationId = filters.occupationId || OCCUPATIONS[0].id
  const hasState = Boolean(filters.stateId)
  const hasDistrict = Boolean(filters.districtId)

  // Three ranking levels, each replacing the sidebar: state -> district -> job role.
  const level = hasDistrict ? 'trade' : hasState ? 'district' : 'state'

  const rows = useMemo(() => {
    if (level === 'trade') {
      return buildTradeRanking({
        districtId: filters.districtId,
        periodId: filters.periodId,
        horizon: filters.horizon,
      }).map((r) => ({
        id: r.occupationId,
        label: r.name,
        sub: `NCO ${r.nco}`,
        score: r.severityScore,
        severity: r.severity,
        status: r.status,
        gap: r.gap,
        demand: r.demand,
        active: filters.occupationId === r.occupationId,
        onClick: () => onSelectOccupation(r.occupationId),
      }))
    }

    if (level === 'district') {
      return buildDistrictRows(occupationId, filters.stateId).map((r) => ({
        id: r.districtId,
        label: r.name,
        sub: null,
        score: r.severityScore,
        severity: r.severity,
        status: r.status,
        gap: r.gap,
        demand: r.demand,
        active: filters.districtId === r.districtId,
        onClick: () => onSelectDistrict(r.districtId),
      }))
    }

    return national.map((r) => ({
      id: r.stateId,
      label: r.name,
      sub: null,
      score: r.severityScore,
      severity: r.severity,
      status: r.status,
      gap: r.gap,
      demand: r.demand,
      active: filters.stateId === r.stateId,
      onClick: () => onSelectState(r.stateId),
    }))
  }, [level, occupationId, filters.stateId, filters.districtId, filters.occupationId, filters.periodId, filters.horizon, national, onSelectDistrict, onSelectOccupation, onSelectState])

  const title =
    level === 'trade' ? t('rank.trade.title') : level === 'district' ? t('rank.district.title') : t('rank.state.title')

  const sidebar = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-line px-4 py-3">
        <Breadcrumb
          state={hasState ? findState(filters.stateId) : null}
          district={
            hasState && hasDistrict
              ? (findState(filters.stateId)?.districts || []).find((d) => d.id === filters.districtId) || null
              : null
          }
          onSelectState={onSelectState}
          onSelectDistrict={onSelectDistrict}
        />
      </div>

      <div className="flex h-11 shrink-0 items-center justify-between gap-3 border-b border-line px-4">
        <h2 className="truncate text-[11px] font-medium tracking-[0.06em] text-ink uppercase">{title}</h2>
        <span className="shrink-0 text-[10px] tracking-[0.06em] text-ink-3 uppercase">
          {t('rank.col.severity')}
        </span>
      </div>

      <div className="flex h-7 shrink-0 items-center gap-2 border-b border-line-soft px-4 text-[9.5px] font-medium tracking-[0.06em] text-ink-3 uppercase">
        <span className="w-4 shrink-0">{t('rank.col.rank')}</span>
        <span className="min-w-0 flex-1">{level === 'trade' ? t('panel.trade') : level === 'district' ? t('panel.district') : t('panel.state')}</span>
        <span className="shrink-0">{t('rank.col.status')}</span>
      </div>

      <ul className="min-h-0 flex-1 divide-y divide-line-soft overflow-y-auto">
        {rows.map((r, i) => (
          <li key={r.id}>
            <button
              type="button"
              onClick={r.onClick}
              aria-current={r.active ? 'true' : undefined}
              className={`w-full px-4 py-2 text-left transition-colors duration-150 hover:bg-panel-3 focus-visible:ring-1 focus-visible:ring-accent focus-visible:outline-none ${
                r.active ? 'bg-accent-soft' : ''
              }`}
            >
              <div className="flex items-baseline gap-2">
                <span className="w-4 shrink-0 text-[10.5px] tabular-nums text-ink-3">{i + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12px] text-ink">{r.label}</span>
                  {r.sub && <span className="block truncate text-[10px] text-ink-3">{r.sub}</span>}
                </span>
                <StatusPill status={r.status} size="sm" />
              </div>

              <div className="mt-1 flex items-center gap-2 pl-6">
                <SeverityScore value={r.score} />
                <span className="shrink-0 text-[10px] text-ink-3">{r.severity}</span>
                <span className="ml-auto shrink-0 text-[10.5px] tabular-nums text-ink-2">{signed(r.gap)}</span>
              </div>
            </button>
          </li>
        ))}
      </ul>

      <details className="group shrink-0 border-t border-line" onToggle={(e) => setShowHow(e.currentTarget.open)}>
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-[11px] font-medium tracking-[0.06em] text-ink-3 uppercase marker:hidden hover:text-ink-2">
          {t('rank.howToRead')}
          <svg
            className={`shrink-0 transition-transform duration-150 ${showHow ? 'rotate-180' : ''}`}
            width="10"
            height="10"
            viewBox="0 0 12 12"
            aria-hidden
          >
            <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </summary>
        {showHow && (
          <ol className="space-y-1.5 px-4 pb-4 text-[11px] leading-relaxed text-ink-2">
            <li>1 · {t('rank.step1')}</li>
            <li>2 · {t('rank.step2')}</li>
            <li>3 · {t('rank.step3')}</li>
          </ol>
        )}
      </details>
    </div>
  )

  const map = (
    <div className="h-full min-h-[52vh] w-full p-0 md:p-4">
      <Suspense
        fallback={
          <div className="grid h-full min-h-[52vh] place-items-center rounded border border-line bg-panel">
            <span className="text-[11px] text-ink-3">{t('map.unavailable')}</span>
          </div>
        }
      >
        <LabourMap
          occupationId={occupationId}
          national={national || buildNationalOverview(occupationId)}
          selectedStateId={filters.stateId}
          selectedDistrictId={filters.districtId}
          onSelectState={onSelectState}
          onSelectDistrict={onSelectDistrict}
          theme={theme}
        />
      </Suspense>
    </div>
  )

  return (
    <div className="flex h-full min-h-0 w-full flex-col md:flex-row">
      <div className="flex min-h-0 flex-1 overflow-hidden">{map}</div>
      <ResizableTrailing
        label={t('panel.districts')}
        minWidth={260}
        maxWidth={420}
        defaultWidth={300}
        collapsed={!rankingOpen}
        onToggleCollapsed={onToggleRanking}
      >
        {sidebar}
      </ResizableTrailing>
    </div>
  )
}