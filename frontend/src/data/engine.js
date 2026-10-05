import { findDistrict, findOccupation, OCCUPATIONS, STATES } from './catalog'
import { makeRng, between } from '../utils/prng'
import { TODAY } from '../utils/format'

const HISTORY_MONTHS = 18

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const STATUS = {
  SHORTAGE: 'shortage',
  BALANCED: 'balanced',
  OVERSUPPLY: 'oversupply',
}

export const PERIODS = [
  { id: 'l12', label: 'Rolling 12 months', scale: 1 },
  { id: 'l24', label: 'Rolling 24 months', scale: 0.94 },
  { id: 'fy2526', label: 'FY 2025–26', scale: 0.89 },
  { id: 'fy2627', label: 'FY 2026–27 (YTD)', scale: 1.06 },
]

export const HORIZONS = [
  { id: 3, label: '3 months' },
  { id: 6, label: '6 months' },
  { id: 12, label: '12 months' },
]

export const GAP_THRESHOLD = 0.1

const MODELS = [
  'SARIMAX + Gradient Boosting ensemble',
  'Temporal Fusion Transformer',
  'Prophet with exogenous regressors',
  'XGBoost with seasonal decomposition',
]

function monthOffset(offset) {
  const d = new Date(TODAY.getFullYear(), TODAY.getMonth() + offset, 1)
  return `${MONTHS[d.getMonth()]} '${String(d.getFullYear()).slice(2)}`
}

function statusFor(ratio) {
  if (ratio > GAP_THRESHOLD) return STATUS.SHORTAGE
  if (ratio < -GAP_THRESHOLD) return STATUS.OVERSUPPLY
  return STATUS.BALANCED
}

export const SEVERITY_ORDER = ['Stable', 'Monitor', 'Low', 'Medium', 'High']

export function severityScore(ratio, status) {
  const r = Math.abs(ratio)
  if (status === STATUS.SHORTAGE) return Math.round(Math.min(100, 55 + r * 150))
  if (status === STATUS.OVERSUPPLY) return Math.round(Math.min(45, 20 + r * 60))
  return Math.round(Math.min(50, r * 200))
}

export function severityFor(ratio, status) {
  const r = Math.abs(ratio)
  if (status === STATUS.BALANCED) return r > 0.07 ? 'Monitor' : 'Stable'
  if (r > 0.3) return 'High'
  if (r > 0.18) return 'Medium'
  return 'Low'
}

function buildSeries(demand, supply, demandRate, supplyRate, horizon) {
  const rows = []
  for (let i = 0; i < HISTORY_MONTHS; i++) {
    const stepsBack = HISTORY_MONTHS - 1 - i
    const wobble = 1 + Math.sin(i * 1.31) * 0.022 + Math.cos(i * 0.77) * 0.014
    const d = Math.round((demand / Math.pow(1 + demandRate, stepsBack)) * wobble)
    const s = Math.round((supply / Math.pow(1 + supplyRate, stepsBack)) * (2 - wobble))
    rows.push({
      label: monthOffset(i - HISTORY_MONTHS + 1),
      kind: 'history',
      demand: d,
      supply: s,
      gap: d - s,
      demandLow: d,
      demandHigh: d,
      supplyLow: s,
      supplyHigh: s,
    })
  }
  for (let i = 1; i <= horizon; i++) {
    const d = Math.round(demand * Math.pow(1 + demandRate, i) * (1 + Math.sin(i) * 0.008))
    const s = Math.round(supply * Math.pow(1 + supplyRate, i))
    const w = 0.01 * i
    rows.push({
      label: monthOffset(i),
      kind: 'forecast',
      demand: d,
      supply: s,
      gap: d - s,
      demandLow: Math.round(d * (1 - w)),
      demandHigh: Math.round(d * (1 + w)),
      supplyLow: Math.round(s * (1 - w)),
      supplyHigh: Math.round(s * (1 + w)),
    })
  }
  return rows
}

function buildReasons({ gapRatio, status, demandRate, supplyRate, funnel, seats, demand, effective }) {
  const matchRate = (effective / funnel.totalTrained) * 100
  const capacityCover = (seats / demand) * 100
  const reasons = []

  if (status === STATUS.OVERSUPPLY) {
    reasons.push({
      title: 'Supply is ahead of demand',
      detail: `Effective supply grew ${(supplyRate * 100 * 12).toFixed(1)}% annualised against demand growth of ${(demandRate * 100 * 12).toFixed(1)}%.`,
    })
    reasons.push({
      title: 'Seat allocation may be overshooting',
      detail: `Annual training seats cover ${capacityCover.toFixed(0)}% of current district demand for this occupation.`,
    })
    reasons.push({
      title: 'Absorption capacity is limited',
      detail: `${matchRate.toFixed(0)}% of the trained pool is competency-matched, but there are not enough open roles to absorb them.`,
    })
    reasons.push({
      title: 'Placement conversion is the constraint',
      detail: 'Hiring pipelines, not training pipelines, are the binding factor in this district.',
    })
    return reasons
  }

  reasons.push({
    title: 'Demand is increasing',
    detail: `Demand is compounding at ${(demandRate * 100 * 12).toFixed(1)}% annualised — ${(demandRate / Math.max(supplyRate, 0.0001)).toFixed(1)}× faster than effective supply.`,
  })
  reasons.push({
    title: 'Relevant trained supply is limited',
    detail: `Only ${matchRate.toFixed(0)}% of everyone trained in this occupation reaches competency-matched effective supply.`,
  })
  reasons.push({
    title: 'Training capacity is not keeping pace',
    detail: `Available seats equal ${capacityCover.toFixed(0)}% of current demand; new intakes cannot close a ${Math.abs(Math.round(gapRatio * 100))}% gap within a single cycle.`,
  })
  reasons.push({
    title: 'Qualification / QP–NOS mismatch',
    detail: `${((1 - funnel.qualificationMatched / funnel.occupationMatched) * 100).toFixed(0)}% of occupation-matched candidates do not hold the required QP and NOS endorsements.`,
  })
  return reasons
}

function buildHiringActions(status, metrics, funnel) {
  const perOpening = metrics.poolPerOpening.toFixed(1)
  if (status === STATUS.OVERSUPPLY) {
    return [
      {
        action: 'Widen the sourcing net beyond this district',
        why: `${perOpening} candidates per opening here — you have more talent than roles to place them in.`,
        tone: 'info',
      },
      {
        action: 'Expect heavy competition on offer acceptance',
        why: `Oversupplied markets push time-to-fill down but acceptance rates down with it.`,
        tone: 'warn',
      },
      {
        action: 'Hire ahead of demand rather than react to it',
        why: 'A surplus is the cheapest time to build a bench before the next shortage cycle.',
        tone: 'ok',
      },
      {
        action: 'Shortlist for adjacent trades with thinner pools',
        why: 'Same skill base, but those trades are short — better conversion and retention.',
        tone: 'info',
      },
    ]
  }
  if (status === STATUS.BALANCED) {
    return [
      {
        action: 'Run a standard sourcing process',
        why: `${perOpening} candidates per opening and ${metrics.timeToFill}-day time-to-fill — no intervention needed.`,
        tone: 'ok',
      },
      {
        action: 'Keep a shortlist warm',
        why: 'Balanced markets tip into shortage within about two quarters.',
        tone: 'info',
      },
      {
        action: 'Verify QP/NOS on shortlisted candidates',
        why: 'Keeps your usable pool honest as certification cycles turn over.',
        tone: 'info',
      },
    ]
  }
  return [
    {
      action: 'Budget for a longer time-to-fill',
      why: `Only ${perOpening} candidates per opening — expect ~${metrics.timeToFill} days at current hiring pace.`,
      tone: 'warn',
    },
    {
      action: 'Source from neighbouring districts',
      why: `${metrics.gapLabel} local shortfall, and the gap widens to ${metrics.forecastGap12Label} by 12 months.`,
      tone: 'warn',
    },
    {
      action: 'Screen for adjacent transferable trades',
      why: `${metrics.mismatchPct}% of candidates hold the trade but fail the QP/NOS filter — they are often viable with a short bridge.`,
      tone: 'info',
    },
    {
      action: 'Raise the offer band or add incentives',
      why: `Competitive range for this trade locally is around ₹${(metrics.salaryBand[0] / 1000).toFixed(0)}–${(metrics.salaryBand[1] / 1000).toFixed(0)}K per month; scarcity pushes it up.`,
      tone: 'info',
    },
    {
      action: 'Partner with local training providers for a direct pipeline',
      why: `${funnel.qpNosMatched.toLocaleString('en-IN')} candidates already hold the right NOS units in this district.`,
      tone: 'ok',
    },
  ]
}

export function buildIntelligence({ occupationId, districtId, periodId = 'l12', horizon = 12 }) {
  const occupation = findOccupation(occupationId)
  const found = findDistrict(districtId)
  if (!occupation || !found) return null

  const { state, district } = found
  const period = PERIODS.find((p) => p.id === periodId) || PERIODS[0]
  const rng = makeRng(occupationId, districtId, periodId)

  const demand = Math.round(occupation.baseDemand * district.weight * period.scale * between(rng, 0.85, 1.15))

  const shapeRoll = rng()
  let gapRatio
  if (shapeRoll < 0.56) gapRatio = between(rng, 0.13, 0.46)
  else if (shapeRoll < 0.86) gapRatio = between(rng, -0.08, 0.09)
  else gapRatio = between(rng, -0.34, -0.12)

  const gap = Math.round(demand * gapRatio)
  const supply = demand - gap
  const status = statusFor(gapRatio)
  const severity = severityFor(gapRatio, status)

  const demandRate = between(rng, 0.008, 0.026)
  const supplyRate = between(rng, 0.002, Math.max(demandRate * 0.6, 0.006))

  // Metrics and forecast cards always read the 3/6/12-month points, whatever
  // horizon the chart is drawing — so build long enough, then trim for the chart.
  const seriesFull = buildSeries(demand, supply, demandRate, supplyRate, Math.max(horizon, 12))
  const q3 = seriesFull[HISTORY_MONTHS + 2]
  const q6 = seriesFull[HISTORY_MONTHS + 5]
  const q12 = seriesFull[HISTORY_MONTHS + 11]
  const series = seriesFull.slice(0, HISTORY_MONTHS + Math.max(horizon, 0))

  const funnel = {
    totalTrained: Math.round(supply / between(rng, 0.14, 0.3)),
  }
  funnel.occupationMatched = Math.round(funnel.totalTrained * between(rng, 0.66, 0.82))
  funnel.qpNosMatched = Math.round(funnel.occupationMatched * between(rng, 0.76, 0.9))
  funnel.qualificationMatched = Math.round(funnel.qpNosMatched * between(rng, 0.7, 0.88))
  funnel.competencyMatched = supply
  funnel.stages = [
    { label: 'Certified in trade', value: funnel.totalTrained, note: 'Holds some certificate in this trade' },
    { label: 'Matched to the role', value: funnel.occupationMatched, note: 'NCO code matches your opening' },
    { label: 'Holds required QP/NOS', value: funnel.qpNosMatched, note: 'Certified against the right units of skill' },
    { label: 'Meets NSQF level', value: funnel.qualificationMatched, note: 'Qualification is valid and current' },
    { label: 'Job-ready talent', value: funnel.competencyMatched, note: 'Assessed able to do the job — your usable pool' },
  ]

  const seats = Math.round(funnel.occupationMatched * between(rng, 0.45, 0.95))
  const capacityTrend = [
    { year: '2024', seats: Math.round(seats * between(rng, 0.55, 0.72)) },
    { year: '2025', seats: Math.round(seats * between(rng, 0.75, 0.9)) },
    { year: '2026', seats },
  ]

  const hired = Math.round(supply * between(rng, 0.55, 0.7))
  const available = supply - hired
  const pipeline = Math.round((funnel.totalTrained - supply) * between(rng, 0.1, 0.18))
  const unmet = Math.max(gap, 0)
  const surplus = Math.max(-gap, 0)
  const distribution = [
    { name: 'Hired / placed', value: hired, color: 'var(--demand)' },
    { name: 'Available, not hired', value: available, color: 'var(--supply)' },
    { name: 'Training pipeline', value: pipeline, color: 'var(--accent)' },
    { name: unmet > 0 ? 'Unmet demand' : 'Surplus supply', value: unmet + surplus, color: 'var(--gap)' },
  ]
  const distributionTotal = distribution.reduce((a, b) => a + b.value, 0)
  const distributionPct = Math.round((distribution[3].value / distributionTotal) * 100)

  const demandYoY = (Math.pow(1 + demandRate, 12) - 1) * 100
  const supplyYoY = (Math.pow(1 + supplyRate, 12) - 1) * 100

  const demandTrend = capacityTrend.map((c, i) => ({
    year: c.year,
    demand: Math.round(demand / Math.pow(1 + demandRate, 2 - i)),
    supply: Math.round(supply / Math.pow(1 + supplyRate, 2 - i)),
  }))

  // Hiring-side metrics: what an HR team acts on, derived from the same supply/demand model.
  const poolPerOpening = supply / Math.max(demand, 1)
  const timeToFill = Math.round(
    Math.max(8, Math.min(120, 26 + gapRatio * 120 + between(rng, -4, 4))),
  )
  const salaryBase = Math.round((occupation.salaryBand[0] + occupation.salaryBand[1]) / 2 / 500) * 500
  const salaryDemand = Math.round(salaryBase * (1 + Math.max(gapRatio, 0) * 0.14))

  const metrics = {
    demand,
    supply,
    gap,
    gapRatio,
    gapLabel: `${gap > 0 ? '+' : gap < 0 ? '−' : ''}${Math.abs(gap).toLocaleString('en-IN')}`,
    demandYoY,
    supplyYoY,
    forecastDemand: q12.demand,
    forecastSupply: q12.supply,
    forecastGap12: q12.gap,
    forecastGap12Label: `${q12.gap > 0 ? '+' : q12.gap < 0 ? '−' : ''}${Math.abs(q12.gap).toLocaleString('en-IN')}`,
    mismatchPct: Math.round((1 - funnel.qualificationMatched / funnel.occupationMatched) * 100),
    poolPerOpening,
    timeToFill,
    salaryBand: [Math.round(salaryDemand * 0.9), Math.round(salaryDemand * 1.15)],
    interviewLoad: Math.round(demand * between(rng, 2.4, 4.1)),
  }

  const reasons = buildReasons({ gapRatio, status, demandRate, supplyRate, funnel, seats, demand, effective: supply })
  const hiringActions = buildHiringActions(status, metrics, funnel)

  const alert =
    status === STATUS.OVERSUPPLY
      ? {
          kind: 'Oversupplied pool',
          headline: 'More certified talent than open roles here.',
          severity,
          detail: 'Expect heavy applicant competition and longer offer-acceptance cycles. Hiring is the constraint, not supply.',
        }
      : status === STATUS.BALANCED
        ? {
            kind: 'Balanced market',
            headline: 'Open roles and available talent are in step.',
            severity,
            detail: 'Hiring should run close to standard time-to-fill. Recheck monthly as demand moves.',
          }
        : {
            kind: 'Talent shortage',
            headline: 'Open roles are growing faster than the available talent pool.',
            severity,
            detail: `Expect roughly ${metrics.timeToFill} days to fill a role here, and rising over the forecast.`,
          }

  const model = MODELS[Math.floor(rng() * MODELS.length)]
  const dataQuality = {
    updatedOn: TODAY,
    records: between(rng, 0.9, 1.7),
    mappingPct: between(rng, 89, 97),
    missingPct: between(rng, 1.2, 4.6),
    model,
    mae: Math.round(demand * between(rng, 0.03, 0.07)),
    rmse: Math.round(demand * between(rng, 0.05, 0.1)),
    mape: between(rng, 3.4, 8.9),
    sources: ['PLFS', 'NCS / NCO postings', 'PMKVY & JSS training records', 'e-Shram registrations'],
  }

  const forecastCards = [
    { months: 3, label: '3 month', value: q3.gap, status: statusFor(q3.gap / q3.demand) },
    { months: 6, label: '6 month', value: q6.gap, status: statusFor(q6.gap / q6.demand) },
    { months: 12, label: '12 month', value: q12.gap, status: statusFor(q12.gap / q12.demand) },
  ]

  return {
    occupation,
    district,
    state,
    period,
    horizon,
    status,
    severity,
    metrics,
    series,
    forecastCards,
    funnel,
    seats,
    capacityTrend,
    demandTrend,
    distribution,
    distributionPct,
    reasons,
    hiringActions,
    alert,
    dataQuality,
    summary: occupation.summary,
    narrative: buildNarrative({ occupation, district, state, status, metrics }),
    thresholdRule: `|gap| ÷ demand > ${GAP_THRESHOLD * 100}% → shortage / oversupply; otherwise balanced`,
  }
}

function buildNarrative({ occupation, district, state, status, metrics }) {
  const dir = status === STATUS.OVERSUPPLY ? 'surplus' : status === STATUS.BALANCED ? 'near-balance' : 'shortage'
  const pool = metrics.poolPerOpening.toFixed(1)
  return `In ${district.name}, ${state.name}, there are ${metrics.demand.toLocaleString('en-IN')} open roles for ${occupation.title.toLowerCase()} against a usable talent pool of ${metrics.supply.toLocaleString('en-IN')} — ${pool} candidate${pool === '1.0' ? '' : 's'} per opening. That is a ${dir} of ${Math.abs(metrics.gap).toLocaleString('en-IN')}, with time-to-fill near ${metrics.timeToFill} days.`
}

export function buildDistrictRows(occupationId, stateId) {
  const state = STATES.find((s) => s.id === stateId)
  if (!state || !occupationId) return []
  return state.districts
    .map((d) => {
      const intel = buildIntelligence({ occupationId, districtId: d.id, horizon: 12 })
      return {
        districtId: d.id,
        name: d.name,
        lon: d.lon,
        lat: d.lat,
        demand: intel.metrics.demand,
        supply: intel.metrics.supply,
        gap: intel.metrics.gap,
        status: intel.status,
        gapRatio: intel.metrics.gapRatio,
        severity: intel.severity,
        severityScore: severityScore(intel.metrics.gapRatio, intel.status),
      }
    })
    .sort((a, b) => b.gap - a.gap)
}

export function buildNationalOverview(occupationId) {
  return STATES.map((s) => {
    const rows = buildDistrictRows(occupationId, s.id)
    const demand = rows.reduce((a, b) => a + b.demand, 0)
    const gap = rows.reduce((a, b) => a + b.gap, 0)
    const status = statusFor(gap / Math.max(demand, 1))
    return {
      stateId: s.id,
      name: s.name,
      demand,
      supply: rows.reduce((a, b) => a + b.supply, 0),
      gap,
      districtCount: rows.length,
      districts: rows,
      status,
      severity: severityFor(gap / Math.max(demand, 1), status),
      severityScore: severityScore(gap / Math.max(demand, 1), status),
    }
  })
}

/**
 * Third ranking level: every trade in one district, ranked by severity.
 * Scoped to a district because a trade only means something against a local pool.
 */
export function buildTradeRanking({ districtId, periodId = 'l12', horizon = 12 }) {
  if (!districtId) return []
  return OCCUPATIONS.map((o) => {
    const intel = buildIntelligence({ occupationId: o.id, districtId, periodId, horizon })
    return {
      occupationId: o.id,
      name: o.title,
      nco: o.nco,
      sector: o.sector,
      demand: intel.metrics.demand,
      supply: intel.metrics.supply,
      gap: intel.metrics.gap,
      gapRatio: intel.metrics.gapRatio,
      status: intel.status,
      severity: intel.severity,
      severityScore: severityScore(intel.metrics.gapRatio, intel.status),
    }
  }).sort((a, b) => b.severityScore - a.severityScore || b.gap - a.gap)
}
