import { useEffect, useMemo, useRef, useState } from 'react'
import { Map as MapLibreMap, NavigationControl, Popup, Marker, config } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
// MapLibre derives its worker URL from `import.meta.url`, which after bundling points at
// this chunk rather than node_modules — the derived path 404s in production. Dev was
// unaffected, which is why this only surfaced on Vercel.
// `?worker&url` makes Vite bundle the worker *and* its `./maplibre-gl-shared.mjs`
// dependency into emitted assets; a plain `?url` copies the file verbatim and leaves
// that import dangling, so the worker still fails to load.
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import india from '../data/indiaStates.json'
import { buildDistrictRows } from '../data/engine'
import { findState } from '../data/catalog'
import { useLang } from '../i18n'

config.WORKER_URL = maplibreWorkerUrl

const ARCGIS = 'https://server.arcgisonline.com/ArcGIS/rest/services'
const TILES = {
  dark: {
    base: `${ARCGIS}/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`,
    labels: `${ARCGIS}/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}`,
  },
  light: {
    base: `${ARCGIS}/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}`,
    labels: `${ARCGIS}/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}`,
  },
}

const STATE_ID_TO_NAME = {
  gj: 'Gujarat',
  mh: 'Maharashtra',
  ka: 'Karnataka',
  tn: 'Tamil Nadu',
  ap: 'Andhra Pradesh',
  up: 'Uttar Pradesh',
  rj: 'Rajasthan',
}

const INDIA_VIEW = { center: [79.5, 22.5], zoom: 4.1 }

// Frame the selected state from its own district extent rather than a fixed point,
// otherwise Gujarat (west) drifts off the left edge.
const viewForState = (stateId) => {
  const state = findState(stateId)
  if (!state) return INDIA_VIEW
  const lons = state.districts.map((d) => d.lon)
  const lats = state.districts.map((d) => d.lat)
  const minLon = Math.min(...lons)
  const maxLon = Math.max(...lons)
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const span = Math.max(maxLon - minLon, (maxLat - minLat) * 1.25)
  const zoom = Math.max(4.2, Math.min(6.6, Math.log2(360 / (span * 1.9))))
  return { center: [(minLon + maxLon) / 2, (minLat + maxLat) / 2], zoom }
}

// MapLibre v6 ships no support probe, so ask the browser directly.
const hasWebGL2 = () => {
  try {
    return Boolean(document.createElement('canvas').getContext('webgl2'))
  } catch {
    return false
  }
}

// MapLibre parses paint values with its own colour parser, which does not understand
// `color-mix()`. Resolve the theme tokens to rgb() in JS instead, or style evaluation
// throws and the whole map (including raster tiles) fails to paint.
const parseColour = (value) => {
  const v = value.trim()
  if (v.startsWith('#')) {
    const h = v.slice(1)
    const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h
    return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16))
  }
  const m = v.match(/rgba?\(([^)]+)\)/)
  if (m) {
    const [r, g, b] = m[1].split(/[,\s/]+/).filter(Boolean)
    return [Number(r), Number(g), Number(b)]
  }
  return [128, 128, 128]
}

const token = (name) =>
  parseColour(getComputedStyle(document.documentElement).getPropertyValue(name))

const mix = (a, b, t) => {
  const k = Math.max(0, Math.min(1, t / 100))
  return `rgb(${a.map((c, i) => Math.round(c + (b[i] - c) * k)).join(',')})`
}

export default function LabourMap({
  occupationId,
  national,
  selectedStateId,
  selectedDistrictId,
  onSelectState,
  onSelectDistrict,
  theme,
}) {
  const { t } = useLang()
  const holder = useRef(null)
  const mapRef = useRef(null)
  const markersRef = useRef([])
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(() => !hasWebGL2())
  const [metric, setMetric] = useState('gap')
  const dark = theme === 'dark'
  // Resolved per theme; MapLibre paint values must be plain rgb()/hex.
  const shell = dark ? [11, 13, 16] : [255, 255, 255]
  const shortage = token('--shortage')
  const supply = token('--supply')
  const accent = token('--accent')

  const byName = useMemo(() => Object.fromEntries(national.map((s) => [s.name, s])), [national])
  const domain = useMemo(() => {
    const v = national.map((s) => s[metric])
    return metric === 'gap' ? Math.max(...v.map(Math.abs), 1) : Math.max(...v, 1)
  }, [national, metric])

  useEffect(() => {
    if (!holder.current || mapRef.current || failed) return

    const map = new MapLibreMap({
      container: holder.current,
      style: { version: 8, sources: {}, layers: [] },
      ...INDIA_VIEW,
      minZoom: 3.4,
      maxZoom: 11,
      attributionControl: { compact: true },
    })
    mapRef.current = map
    map.addControl(new NavigationControl({ showCompass: false }), 'bottom-right')

    map.on('load', () => {
      const tiles = TILES.dark
      const attribution = 'Esri, HERE, Garmin, © OpenStreetMap contributors'
      map.addSource('base', { type: 'raster', tiles: [tiles.base], tileSize: 256, maxzoom: 16, attribution })
      map.addSource('baselabels', { type: 'raster', tiles: [tiles.labels], tileSize: 256, maxzoom: 16, attribution })
      map.addLayer({ id: 'base', type: 'raster', source: 'base', paint: { 'raster-fade-duration': 250 } })
      map.addLayer({
        id: 'baselabels',
        type: 'raster',
        source: 'baselabels',
        paint: { 'raster-opacity': 0.5, 'raster-fade-duration': 200 },
      })

      map.addSource('states', { type: 'geojson', data: india, promoteId: 'name' })

      // Neutral wash for every state, so the shape of India reads even where we have no data.
      map.addLayer({
        id: 'states-wash',
        type: 'fill',
        source: 'states',
        paint: { 'fill-color': '#171B20', 'fill-opacity': 0.55 },
      })

      // Choropleth, only where we actually model data.
      map.addLayer({
        id: 'states-data',
        type: 'fill',
        source: 'states',
        filter: ['==', ['get', 'name'], ''],
        paint: { 'fill-color': ['get', 'c'], 'fill-opacity': 0.7 },
      })

      map.addLayer({
        id: 'states-line',
        type: 'line',
        source: 'states',
        paint: {
          'line-color': ['case', ['boolean', ['feature-state', 'sel'], false], '#3B82F6', 'rgba(242,243,245,0.10)'],
          'line-width': ['case', ['boolean', ['feature-state', 'sel'], false], 1.6, 0.5],
        },
      })

      map.addSource('districts', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
      map.addLayer({
        id: 'district-halo',
        type: 'circle',
        source: 'districts',
        paint: {
          'circle-radius': ['+', ['get', 'r'], 6],
          'circle-color': ['get', 'c'],
          'circle-opacity': 0.2,
          'circle-blur': 0.7,
        },
      })
      map.addLayer({
        id: 'district-dot',
        type: 'circle',
        source: 'districts',
        paint: {
          'circle-radius': ['get', 'r'],
          'circle-color': ['get', 'c'],
          'circle-stroke-color': '#0B0D10',
          'circle-stroke-width': 1.5,
        },
      })
      map.addLayer({
        id: 'district-active',
        type: 'circle',
        source: 'districts',
        filter: ['==', ['get', 'active'], true],
        paint: { 'circle-radius': ['+', ['get', 'r'], 4], 'circle-color': 'transparent', 'circle-stroke-color': '#3B82F6', 'circle-stroke-width': 2 },
      })

      // The grid can still be settling when MapLibre measures, so nudge it once.
      requestAnimationFrame(() => map.resize())

      setReady(true)
    })

    map.on('error', (e) => {

      // Raster tiles can fail on a flaky venue Wi-Fi; don't let that blank the panel.
      if (e?.error?.status === 404 || /worker/i.test(String(e?.error?.message))) {
        setFailed(true)
        map.remove()
        mapRef.current = null
      }
    })

    return () => {
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []
      map.remove()
      mapRef.current = null
    }
  }, [failed])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    const t = TILES[theme === 'dark' ? 'dark' : 'light']
    map.getSource('base')?.setTiles([t.base])
    map.getSource('baselabels')?.setTiles([t.labels])
    map.setPaintProperty('states-wash', 'fill-color', dark ? '#171B20' : '#F7F8F9')
    map.setPaintProperty('states-wash', 'fill-opacity', dark ? 0.5 : 0.65)
    map.setPaintProperty('states-line', 'line-color', dark ? 'rgba(242,243,245,0.10)' : 'rgba(11,13,16,0.16)')
    map.setPaintProperty('baselabels', 'raster-opacity', dark ? 0.5 : 0.85)
  }, [theme, ready, dark])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    const src = map.getSource('states')
    if (!src) return
    const known = national.filter((s) => byName[s.name])
    const colour = (v) =>
      metric === 'gap'
        ? mix(v > 0 ? shortage : supply, shell, 10 + (Math.abs(v) / domain) * 62)
        : mix(accent, shell, 8 + (v / domain) * 60)

    src.setData({
      type: 'FeatureCollection',
      features: india.features.map((f) => {
        const row = byName[f.properties.name]
        return row
          ? { ...f, properties: { ...f.properties, c: colour(row[metric]) } }
          : f
      }),
    })
    map.setFilter(
      'states-data',
      ['in', ['get', 'name'], ['literal', known.map((s) => s.name)]],
    )
  }, [national, metric, domain, ready, byName, shell, shortage, supply, accent])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    const src = map.getSource('districts')
    if (!src) return
    const rows = selectedStateId ? buildDistrictRows(occupationId, selectedStateId) : []
    const mx = Math.max(...rows.map((r) => Math.abs(r.gap)), 1)
    const colour = (g) => mix(g > 0 ? shortage : supply, shell, 30 + (Math.abs(g) / mx) * 70)

    src.setData({
      type: 'FeatureCollection',
      features: rows.map((r) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [r.lon, r.lat] },
        properties: {
          name: r.name,
          id: r.districtId,
          demand: r.demand,
          supply: r.supply,
          gap: r.gap,
          r: Math.max(5, Math.min(18, Math.sqrt(Math.abs(r.gap)) / 2.7)),
          c: colour(r.gap),
          active: r.districtId === selectedDistrictId,
        },
      })),
    })

    // Labels as DOM markers: the raster style has no glyph server, so a symbol layer can't work.
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = rows.map((r) => {
      const el = document.createElement('div')
      el.className = 'lm-label'
      el.textContent = r.name
      el.style.setProperty('--dot', colour(r.gap))
      return new Marker({ element: el, anchor: 'bottom', offset: [0, -12], interactive: false })
        .setLngLat([r.lon, r.lat])
        .addTo(map)
    })
  }, [occupationId, selectedStateId, selectedDistrictId, ready, shell, shortage, supply])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    for (const f of india.features) map.setFeatureState({ source: 'states', id: f.properties.name }, { sel: false })
    const name = STATE_ID_TO_NAME[selectedStateId]
    if (name) map.setFeatureState({ source: 'states', id: name }, { sel: true })
    map.flyTo({ ...(name ? viewForState(selectedStateId) : INDIA_VIEW), duration: 850 })
  }, [selectedStateId, ready])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !ready) return
    const popup = new Popup({ closeButton: false, offset: 14, className: 'lm-popup' })

    const onMove = (e) => {
      const f = map.queryRenderedFeatures(e.point, { layers: ['district-dot', 'states-data'] })[0]
      if (!f) return
      const p = f.properties
      const isDistrict = p.id
      map.getCanvas().style.cursor = 'pointer'
      popup
        .setLngLat(f.geometry.type === 'Point' ? f.geometry.coordinates : e.lngLat)
        .setHTML(
          `<div class="lm-pop">
             <div class="lm-pop-t">${p.name}</div>
             ${isDistrict
               ? `<div class="lm-pop-r"><span>Open roles</span><b>${Number(p.demand ?? 0).toLocaleString('en-IN')}</b></div>
                  <div class="lm-pop-r"><span>Talent pool</span><b>${Number(p.supply ?? 0).toLocaleString('en-IN')}</b></div>
                  <div class="lm-pop-r"><span>Gap</span><b class="${(p.gap ?? 0) > 0 ? 'lm-short' : 'lm-ok'}">${(p.gap ?? 0) > 0 ? '+' : '−'}${Math.abs(Number(p.gap ?? 0)).toLocaleString('en-IN')}</b></div>`
               : ''}
           </div>`,
        )
        .addTo(map)
    }
    const onClick = (e) => {
      const f = map.queryRenderedFeatures(e.point, { layers: ['district-dot', 'states-data'] })[0]
      if (!f) return
      if (f.properties.id) return onSelectDistrict(f.properties.id)
      const row = national.find((s) => s.name === f.properties.name)
      if (row) onSelectState(row.stateId === selectedStateId ? '' : row.stateId)
    }

    map.on('mousemove', onMove)
    map.on('click', onClick)
    return () => {
      map.off('mousemove', onMove)
      map.off('click', onClick)
      popup.remove()
    }
  }, [ready, national, selectedStateId, onSelectDistrict, onSelectState, t])

  if (failed) {
    return (
      <div className="grid h-full min-h-[420px] place-items-center rounded border border-line bg-panel px-6 text-center">
        <div>
          <p className="text-[14px] font-medium text-ink">{t('map.unavailable')}</p>
          <p className="mx-auto mt-2 max-w-[38ch] text-[11.5px] leading-relaxed text-ink-3">
            {t('map.unavailableBody')}
          </p>
        </div>
      </div>
    )
  }

  const ramp = metric === 'gap'
    ? ['#3FA77A', '#8FA07A', '#C9973E', '#D96A52', '#E05252']
    : ['#171B20', '#26364F', '#3D5273', '#54709B', '#6B8FD6']

  return (
    <div className="relative h-full w-full overflow-hidden rounded border border-line">
      <div ref={holder} className="h-full w-full" />

      <div className="pointer-events-none absolute inset-0">
        <div className="pointer-events-auto absolute top-3 left-3 flex flex-col gap-3">
          <div className="flex border border-line bg-panel">
            {[
              ['gap', t('map.metric.gap')],
              ['demand', t('map.metric.demand')],
              ['supply', t('map.metric.supply')],
            ].map(([id, label], i) => (
              <button
                key={id}
                type="button"
                onClick={() => setMetric(id)}
                aria-pressed={metric === id}
                className={`px-3 py-1.5 text-[11px] font-medium transition-colors duration-150 focus-visible:ring-1 focus-visible:ring-accent focus-visible:outline-none ${
                  i > 0 ? 'border-l border-line' : ''
                } ${metric === id ? 'bg-accent-soft text-ink' : 'text-ink-3 hover:text-ink-2'}`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="w-[164px]">
            <p className="mb-1.5 text-[9px] font-medium tracking-[0.12em] text-ink-3 uppercase">
              {metric === 'gap' ? 'Surplus \u2192 shortage' : `${metric} intensity`}
            </p>
            <div className="flex h-1.5 w-full">
              {ramp.map((c, i) => (
                <span
                  key={i}
                  className={`h-full ${i > 0 ? 'ml-px' : ''}`}
                  style={{ background: c, flex: 1 }}
                />
              ))}
            </div>
            <div className="mt-1 flex justify-between text-[8.5px] text-ink-3">
              <span>{metric === 'gap' ? t('map.legend.surplus') : t('map.legend.low')}</span>
              <span>{t('map.legend.critical')}</span>
            </div>
          </div>
        </div>

        {selectedStateId && (
          <button
            type="button"
            onClick={() => onSelectState('')}
            className="pointer-events-auto absolute top-3 right-3 border border-line bg-panel px-2.5 py-1.5 text-[11px] font-medium text-ink-2 transition-colors duration-150 hover:border-accent hover:text-ink focus-visible:ring-1 focus-visible:ring-accent focus-visible:outline-none"
          >
            {t('map.allIndia')}
          </button>
        )}
      </div>
    </div>
  )
}
