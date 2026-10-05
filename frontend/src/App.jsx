import { useCallback, useEffect, useMemo, useState } from 'react'
import FilterPanel from './components/FilterPanel'
import OccupationExplorer from './components/OccupationExplorer'
import MapViewDraggable from './pages/MapViewDraggable'
import OccupationReport from './pages/OccupationReport'
import { OCCUPATIONS, findState } from './data/catalog'
import { buildIntelligence, buildNationalOverview } from './data/engine'
import HudTop from './components/HudTop'
import ResizablePanel from './components/ResizablePanel'

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
    />
  )

  return (
    <div className="flex h-full min-h-0 flex-col bg-bg">
      <HudTop
        view={view}
        onViewChange={setView}
        filters={filters}
      />
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
        <ResizablePanel left={leftPanel} right={center} minLeft={276} maxLeft={420} defaultLeft={276} />
        <OccupationExplorer filters={filters} onSelect={handleSelectOccupation} />
      </div>
    </div>
  )
}
