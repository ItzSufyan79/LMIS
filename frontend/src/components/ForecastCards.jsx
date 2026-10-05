import { Card, SectionHead, StatusPill } from './ui'
import { signed } from '../utils/format'
import { GAP_THRESHOLD } from '../data/engine'
import { useLang } from '../i18n'

export default function ForecastCards({ intel, onChange }) {
  const { t } = useLang()
  const active = intel.horizon

  return (
    <Card delay={140}>
      <SectionHead
        title={t('forecast.title')}
        hint={`${t('forecast.hint')}${(GAP_THRESHOLD * 100).toFixed(0)}%`}
      />

      <div className="grid sm:grid-cols-3">
        {intel.forecastCards.map((card, i) => {
          const isActive = card.months === active
          const color = card.value > 0 ? 'var(--gap)' : 'var(--supply)'

          return (
            <button
              key={card.months}
              type="button"
              onClick={() => onChange?.({ horizon: card.months })}
              aria-pressed={isActive}
              className={`flex flex-col items-start px-4 py-4 text-left transition-colors duration-150 focus-visible:ring-1 focus-visible:ring-accent focus-visible:outline-none ${
                i > 0 ? 'border-t border-line-soft sm:border-t-0 sm:border-l' : ''
              } ${isActive ? 'bg-accent-soft' : 'hover:bg-panel-3'}`}
            >
              <span className="text-[10px] font-medium tracking-[0.06em] text-ink-3 uppercase">
                {card.label}
              </span>

              <span
                className="mt-2 text-[28px] leading-none font-semibold tabular-nums tracking-[-0.01em]"
                style={{ color }}
              >
                {signed(card.value)}
              </span>

              <span className="mt-2.5 flex items-center gap-2">
                <StatusPill status={card.status} size="sm" />
                <span className="text-[11px] text-ink-3">
                  {card.value > 0 ? t('forecast.shortOfTalent') : card.value < 0 ? t('forecast.surplus') : t('forecast.inBalance')}
                </span>
              </span>

              {isActive && <span className="mt-3 text-[10px] text-accent">{t('forecast.selected')}</span>}
            </button>
          )
        })}
      </div>

      <p className="border-t border-line-soft px-4 py-2.5 text-[11px] text-ink-3">
        {t('forecast.footnote')}
      </p>
    </Card>
  )
}