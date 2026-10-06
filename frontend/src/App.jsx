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

// Start at the India level: the app opens on the full-India map with the state
// severity ranking, then drills down.
const DEFAULT_FILTERS = {
  stateId: '',
  districtId: '',
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
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('lmis-theme')
    if (stored === 'light' || stored === 'dark') return stored
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark')
    document.documentElement.classList.add(theme)
    localStorage.setItem('lmis-theme', theme)
  }, [theme])

  const applyPatch = useCallback((patch) => setFilters((f) => ({ ...f, ...patch })), [])

  // Picking a job role is the one action that means "show me the hiring brief".
  const openTrade = useCallback(
    (id) => {
      setFilters((f) => ({ ...f, occupationId: id }))
      if (filters.districtId) setView('report')
    },
    [filters.districtId],
  )

  const handleFilterChange = useCallback(
    (patch) => {
      if (Object.hasOwn(patch, 'occupationId') && patch.occupationId !== filters.occupationId) {
        openTrade(patch.occupationId)
        return
      }
      applyPatch(patch)
    },
    [applyPatch, openTrade, filters.occupationId],
  )

  const handleSelectState = useCallback((id) => applyPatch({ stateId: id, districtId: '' }), [applyPatch])
  const handleSelectDistrict = useCallback((id) => applyPatch({ districtId: id }), [applyPatch])

  const districts = useMemo(() => findState(filters.stateId)?.districts || [], [filters.stateId])

  const national = useMemo(
    () => buildNationalOverview(filters.occupationId || OCCUPATIONS[0].id),
    [filters.occupationId],
  )

  const intel = useMemo(() => {
    if (!filters.occupationId || !filters.districtId) return null
    return buildIntelligence(filters)
  }, [filters])

  const showReport = view === 'report' && Boolean(intel)

  const leftPanel = (
    <FilterPanel
      filters={filters}
      onChange={handleFilterChange}
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
      onSelectState={handleSelectState}
      onSelectDistrict={handleSelectDistrict}
      onSelectOccupation={openTrade}
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
        reportEnabled={Boolean(intel)}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
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
          <OccupationExplorer filters={filters} onSelect={openTrade} />
        </ResizableTrailing>
      </div>
    </div>
  )
}
