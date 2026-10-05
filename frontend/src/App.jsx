import { useCallback, useEffect, useMemo, useState } from 'react'
import FilterPanel from './components/FilterPanel'
import OccupationExplorer from './components/OccupationExplorer'
import MapViewDraggable from './pages/MapViewDraggable'
import OccupationReport from './pages/OccupationReport'
import { OCCUPATIONS, findState } from './data/catalog'
import { buildIntelligence, buildNationalOverview } from './data/engine'
import HudTop from './components/HudTop'
import ResizablePanel from './components/ResizablePanel'
import ResizableTrailing from './components/ResizableTrailing'
import { useMediaQuery } from './hooks/useMediaQuery'

const DEFAULT_FILTERS = {
  stateId: 'gj',
  districtId: 'gj-ahmedabad',
  occupationId: '',
  periodId: 'l12',
  horizon: 12,
}

export default function App() {
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [view, setView] = useState('map')
  // Three side panels plus a usable map need ~1600px, so the two secondary panels start
  // closed below that; on phones Filters starts closed too, leaving the map — the thing
  // the page is about — as the first thing on screen.
  // These are only defaults: an explicit toggle is remembered per panel, otherwise the
  // breakpoint would override the user and a collapsed panel could never be reopened.
  const isWide = useMediaQuery('(min-width: 1600px)')
  const isCompact = useMediaQuery('(max-width: 767px)')
  const defaults = { filters: !isCompact, districts: isWide, trades: isWide }
  const [overrides, setOverrides] = useState({})

  const panels = {
    filters: overrides.filters ?? defaults.filters,
    districts: overrides.districts ?? defaults.districts,
    trades: overrides.trades ?? defaults.trades,
  }

  const togglePanel = (key) =>
    setOverrides((o) => ({ ...o, [key]: !(o[key] ?? defaults[key]) }))
  const [theme] = useState(() => {
    const stored = localStorage.getItem('lmis-theme')
    if (stored === 'light' || stored === 'dark') return stored
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)
    localStorage.setItem('lmis-theme', theme)
  }, [theme])

  const applyPatch = useCallback(
    (patch) => {
      const next = { ...filters, ...patch }
      setFilters(next)
      setView(next.occupationId && next.districtId ? 'report' : 'map')
    },
    [filters],
  )

  const districts = useMemo(() => findState(filters.stateId)?.districts || [], [filters.stateId])

  const national = useMemo(
    () => buildNationalOverview(filters.occupationId || OCCUPATIONS[0].id),
    [filters.occupationId],
  )

  const intel = useMemo(() => {
    if (!filters.occupationId || !filters.districtId) return null
    return buildIntelligence(filters)
  }, [filters])

  const handleSelectOccupation = useCallback(
    (id) => {
      applyPatch({ occupationId: id })
    },
    [applyPatch],
  )

  const showReport = view === 'report' && Boolean(intel)

  const leftPanel = (
    <FilterPanel
      filters={filters}
      onChange={applyPatch}
      onReset={() => {
        setFilters(DEFAULT_FILTERS)
        setView('map')
      }}
      districts={districts}
      intel={intel}
    />
  )

  const center = showReport ? (
    <OccupationReport intel={intel} onBack={() => setView('map')} onChange={applyPatch} />
  ) : (
    <MapViewDraggable
      filters={filters}
      national={national}
      theme={theme}
      onSelectState={(id) => applyPatch({ stateId: id, districtId: '' })}
      onSelectDistrict={(id) => applyPatch({ districtId: id })}
      rankingOpen={panels.districts}
      onToggleRanking={() => togglePanel('districts')}
    />
  )

  return (
    <div className="flex h-full min-h-0 flex-col bg-bg">
      <HudTop
        view={view}
        onViewChange={setView}
        filters={filters}
      />
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto md:flex-row md:overflow-hidden">
        <ResizablePanel
          left={leftPanel}
          right={center}
          minLeft={240}
          maxLeft={420}
          defaultLeft={276}
          collapsed={!panels.filters}
          onToggleCollapsed={() => togglePanel('filters')}
          leftLabel="Filters"
        />
        <ResizableTrailing
          label="Trades"
          minWidth={230}
          maxWidth={420}
          defaultWidth={288}
          collapsed={!panels.trades}
          onToggleCollapsed={() => togglePanel('trades')}
        >
          <OccupationExplorer filters={filters} onSelect={handleSelectOccupation} />
        </ResizableTrailing>
      </div>
    </div>
  )
}
