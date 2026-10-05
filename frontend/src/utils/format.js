const intFmt = new Intl.NumberFormat('en-IN')

export const fmt = (n) => intFmt.format(Math.round(n))

export const fmtCompact = (n) => {
  const abs = Math.abs(n)
  if (abs >= 1e7) return `${(n / 1e7).toFixed(1)}Cr`
  if (abs >= 1e5) return `${(n / 1e5).toFixed(1)}L`
  if (abs >= 1e3) return `${(n / 1e3).toFixed(1)}K`
  return intFmt.format(Math.round(n))
}

export const signed = (n) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${fmt(Math.abs(n))}`

export const signedCompact = (n) =>
  `${n > 0 ? '+' : n < 0 ? '−' : ''}${fmtCompact(Math.abs(n))}`

export const pct = (n, digits = 1) => `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n).toFixed(digits)}%`

export const pctPlain = (n, digits = 0) => `${n.toFixed(digits)}%`

export const TODAY = new Date(2026, 9, 3)
