import { CaretRight } from '@phosphor-icons/react'
import { useLang } from '../i18n'

/**
 * India → State → District. Each crumb steps back up one level, so it doubles as
 * the back navigation between ranking levels.
 */
export default function Breadcrumb({ state, district, onSelectState, onSelectDistrict, className = '' }) {
  const { t } = useLang()

  const crumbs = [{ id: 'in', label: t('nav.India'), onClick: () => onSelectState('') }]
  if (state) crumbs.push({ id: state.id, label: state.name, onClick: () => onSelectDistrict('') })
  if (district) crumbs.push({ id: district.id, label: district.name, onClick: () => {} })

  return (
    <nav aria-label={t('nav.breadcrumb')} className={`flex min-w-0 items-center gap-1 ${className}`}>
      {crumbs.map((c, i) => {
        const isLast = i === crumbs.length - 1
        return (
          <span key={c.id} className="flex min-w-0 items-center gap-1">
            {i > 0 && <CaretRight size={10} className="shrink-0 text-ink-3" aria-hidden />}
            {isLast ? (
              <span aria-current="page" className="truncate text-[12px] text-ink">
                {c.label}
              </span>
            ) : (
              <button
                type="button"
                onClick={c.onClick}
                className="truncate text-[12px] text-ink-3 transition-colors duration-150 hover:text-ink focus-visible:ring-1 focus-visible:ring-accent focus-visible:outline-none"
              >
                {c.label}
              </button>
            )}
          </span>
        )
      })}
    </nav>
  )
}
