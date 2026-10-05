# SIH26246 — LMIS (Labour Market Intelligence System)

Frontend-only prototype for **SIH26246** (Ministry of Skill Development & Entrepreneurship).

**Audience: job hirers, HR teams and company recruiters.** The question it answers is narrow:

> For this trade, in this district — are there enough good people to hire, and what does that mean
> for my search?

The brief reads top-to-bottom: what is needed → what is available → what is the gap → will it grow →
why → what to do about it.

## Run

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
npm run lint       # oxlint
npm run build
npm run preview
```

`?theme=light` forces the light theme; the status-bar toggle is the normal path.

## Stack

| Choice | Why |
|---|---|
| Vite + React 19 + Tailwind v4 | Fast, matches your other repos |
| **MapLibre GL 6** + **ArcGIS raster tiles** | Keyless — no tile account, no API key in a public repo |
| **Recharts** | Open roles vs talent trend |
| **Motion** (`motion/react`) | KPI count-ups. Only one animation lib — they are alternatives, not a stack |
| **Phosphor** (duotone) | Replaced Lucide, which has become the default "AI-generated" icon set |
| **Fontshare** | Clash Display, Cabinet Grotesk, Switzer, Sentient, Tabular |

## Map

Tiles come from Esri's public ArcGIS services — **no API key required**:

- `Canvas/World_Dark_Gray_Base` + `Canvas/World_Dark_Gray_Reference` (dark)
- `Canvas/World_Light_Gray_Base` + `Canvas/World_Light_Gray_Reference` (light)

The gap choropleth is a GeoJSON fill layer on top (`src/data/indiaStates.json`, GADM-derived,
Douglas–Peucker simplified to ~68 KB). Districts render as circle layers with DOM label markers —
the raster basemap style ships no glyph server, so a symbol layer cannot place text.

District drill-down uses lon/lat markers, not district polygons, to keep the payload demo-friendly.
Full India district GeoJSON is ~15–25 MB raw; simplify or state-filter it if you upgrade this.

If WebGL2 is unavailable the map degrades to a message and the ranked list still works.

## Screens

**Explorer (default)** — left rail filters (state, district, trade, period, horizon) + talent-mix
donut + hiring read-out; centre map with state → district drill-down; right rail searchable trade
list with live open roles / talent / gap.

**Hiring brief** — opens once a trade and a district are both selected:

1. Header — trade, district + state, sector, NCO, period, horizon, status, severity
2. Six KPIs — open roles, available talent, talent gap, and the 12M forecasts
3. Recruiter strip — **candidates per opening**, **est. time to fill**, **local offer band**,
   **interviews to fill**
4. The gap — `open roles − job-ready talent = gap`
5. Open roles vs talent trend — 18 months history + forecast, divider at "now", widening uncertainty
   band, gap shaded between the lines
6. Talent gap forecast — 3M / 6M / 12M
7. Early warning — district, trade, current gap, 12M gap, severity, trend, detected date
8. Open roles + "why the talent pool is smaller" funnel (certified → matched → QP/NOS → NSQF → job-ready)
9. Gap reasons + talent pipeline (intake/year, certified here, job-ready now, pipeline growth)
10. What to screen for — skills, NCO, QP, NOS, NSQF, accepted qualifications
11. What to do about it — each action names the metric that produced it
12. Data & model — freshness, records, mapping %, missing %, model, MAE/RMSE/MAPE

## Data

Deterministic mock data seeded on `hash(trade + district + period)` (`src/data/engine.js`), so a
given selection always returns the same numbers. Shaped to mirror the real pipeline: PLFS,
NCS/NCO postings, PMKVY/JSS training records, e-Shram registrations.

Verdict rule: `|gap| ÷ open roles > 10%` → shortage / oversupply, otherwise balanced. One place to
change: `GAP_THRESHOLD`.

Swap `buildIntelligence()` for an API call when the backend lands.

## Gotchas found the hard way

- **MapLibre cannot parse `color-mix()`.** It throws while evaluating the style, which aborts the
  *entire* style load — the map goes blank including raster tiles. `LabourMap` resolves theme
  tokens to `rgb()` in JS for this reason.
- **`optimizeDeps.exclude: ['maplibre-gl']`** — Vite's dep pre-bundling breaks MapLibre's worker
  in dev only.
- **Fontshare's CSS API honours only the first `f[]` parameter.** One `<link>` per family.
- **MapLibre v6 has no default export** and no `supported()` probe; use named imports and ask the
  browser for WebGL2 yourself.

## Known gaps

- Salary bands and time-to-fill are modelled, not observed — there is no real source yet.
- 7 states / 25 districts / 10 trades. Extend `src/data/catalog.js`.
- Card entrance animation is CSS only (Motion is used for count-ups).
