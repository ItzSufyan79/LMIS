import React from 'react'
export const STATUS_META = {
  shortage: { label: 'Shortage', color: 'var(--shortage)' },
  balanced: { label: 'Balanced', color: 'var(--supply)' },
  oversupply: { label: 'Oversupply', color: 'var(--oversupply)' },
}

export function StatusPill({ status, size = 'md' }) {
  const meta = STATUS_META[status] || STATUS_META.balanced
  const text = size === 'sm' ? 'text-[10px]' : 'text-[11px]'
  return (
    <span className={`inline-flex items-center gap-1.5 ${text} font-medium text-ink-2`}>
      <span className="size-1.5 shrink-0" style={{ background: meta.color }} aria-hidden />
      {meta.label}
    </span>
  )
}

export function CollapsibleCard({ children, className = '', delay = 0, defaultCollapsed = false, ...rest }) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed)
  return (
    <section
      className={`border border-line ${className}`}
      style={{ animationDelay: `${delay}ms` }}
      {...rest}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === SectionHead) {
          return React.cloneElement(child, {
            collapsible: true,
            collapsed,
            onToggle: () => setCollapsed((c) => !c),
          })
        }
        return child
      })}
      {!collapsed && (
        <div>
          {React.Children.toArray(children).filter((c) => !(React.isValidElement(c) && c.type === SectionHead))}
        </div>
      )}
    </section>
  )
}

export function Card({ children, className = '', delay = 0, collapsible = false, defaultCollapsed = false, ...rest }) {
  if (collapsible) {
    return (
      <CollapsibleCard className={className} delay={delay} defaultCollapsed={defaultCollapsed} {...rest}>
        {children}
      </CollapsibleCard>
    )
  }
  return (
    <section
      className={`border border-line ${className}`}
      style={{ animationDelay: `${delay}ms` }}
      {...rest}
    >
      {children}
    </section>
  )
}

export function SectionHead({ icon: Icon, title, hint, action, collapsible = false, collapsed = false, onToggle }) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-line-soft px-5 py-3.5">
      <div className="flex min-w-0 items-baseline gap-2.5">
        {Icon && <Icon size={13} weight="regular" className="shrink-0 self-center text-ink-3" aria-hidden />}
        <h2 className="truncate text-[12px] font-medium tracking-[0.02em] text-ink">{title}</h2>
        {hint && <span className="truncate text-[11px] text-ink-3">{hint}</span>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {action}
        {collapsible && (
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={!collapsed}
            aria-label={collapsed ? `Expand ${title}` : `Collapse ${title}`}
            className="p-1 text-ink-3 transition-colors duration-150 hover:text-ink focus-visible:ring-1 focus-visible:ring-accent focus-visible:outline-none"
          >
            <svg
              className={`transition-transform duration-150 ${collapsed ? '' : 'rotate-180'}`}
              width="10"
              height="10"
              viewBox="0 0 12 12"
              aria-hidden
            >
              <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
    </header>
  )
}

export function Chip({ children, tone = 'neutral' }) {
  const tones = {
    neutral: 'border-line text-ink-2',
    accent: 'border-accent/30 bg-accent-soft text-accent',
  }
  return (
    <span className={`inline-flex items-center gap-1 border px-1.5 py-0.5 text-[10.5px] font-medium ${tones[tone]}`}>
      {children}
    </span>
  )
}

export function Metric({ label, value, sub, tone = 'ink', big = false }) {
  const colors = {
    ink: 'var(--ink)',
    demand: 'var(--demand)',
    supply: 'var(--supply)',
    gap: 'var(--gap)',
    accent: 'var(--accent)',
  }
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-medium tracking-[0.06em] text-ink-3 uppercase">{label}</p>
      <p
        className={`mt-1.5 font-semibold tabular-nums ${big ? 'text-[30px] leading-none' : 'text-[22px] leading-none'}`}
        style={{ color: colors[tone] }}
      >
        {value}
      </p>
      {sub && <p className="mt-1.5 text-[11px] text-ink-3">{sub}</p>}
    </div>
  )
}

export function Bar({ value, color = 'var(--accent)', height = 4 }) {
  return (
    <div className="w-full overflow-hidden bg-panel-3" style={{ height }}>
      <div
        className="h-full transition-[width] duration-500 ease-out"
        style={{ width: `${Math.max(1, Math.min(100, value))}%`, background: color }}
      />
    </div>
  )
}
