import { Moon, Sun } from '@phosphor-icons/react'
import { Link } from 'react-router-dom'
import { useLang, LANGUAGES } from '../i18n'
import { useAuth } from '../auth'

const PERIOD_LABEL = {
  l3: 'L3',
  l6: 'L6',
  l12: 'L12',
}

const HORIZON_LABEL = { 3: '3M', 6: '6M', 12: '12M' }

function titleCase(id) {
  if (!id) return ''
  return id
    .split('-')
    .slice(1)
    .join(' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export default function HudTop({
  view = 'map',
  onViewChange,
  filters = {},
  reportEnabled = false,
  theme = 'dark',
  onToggleTheme,
}) {
  const { t, lang, setLanguage } = useLang()
  const { user, signOut } = useAuth()
  const { stateId = '', districtId = '', periodId = 'l12', horizon = 12 } = filters

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-6 border-b border-line bg-bg px-5">
      <div className="flex min-w-0 items-baseline gap-4">
        <span className="shrink-0 text-[13px] font-semibold tracking-[-0.01em] text-ink">{t('app.name')}</span>
        <span className="hidden truncate text-[11px] text-ink-3 sm:inline">{t('app.full')}</span>
      </div>

      <div className="flex shrink-0 items-center gap-5">
        {user ? (
          <div className="hidden items-center gap-2 lg:flex">
            <span className="max-w-[160px] truncate text-[11px] text-ink-2">{user.name}</span>
            <button
              type="button"
              onClick={signOut}
              title={t('auth.signOut')}
              className="text-[11px] text-ink-3 transition-colors duration-150 hover:text-ink focus-visible:ring-1 focus-visible:ring-accent focus-visible:outline-none"
            >
              {t('auth.signOut')}
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="hidden shrink-0 text-[11.5px] text-ink-2 transition-colors duration-150 hover:text-ink focus-visible:ring-1 focus-visible:ring-accent focus-visible:outline-none lg:block"
          >
            {t('auth.signIn')}
          </Link>
        )}

        {stateId && (
          <p className="hidden truncate text-[11.5px] text-ink-2 md:max-w-[320px]">
            {stateId.replace(/^in-?/, '').toUpperCase()}
            {districtId && ` · ${titleCase(districtId)}`}
          </p>
        )}

        <p className="hidden text-[11px] text-ink-3 lg:block">
          {PERIOD_LABEL[periodId] || periodId.toUpperCase()} · {HORIZON_LABEL[horizon] || `${horizon}M`}
        </p>

        <div className="relative shrink-0">
          <label className="sr-only" htmlFor="lmis-lang">
            {t('lang.label')}
          </label>
          <select
            id="lmis-lang"
            value={lang}
            onChange={(e) => setLanguage(e.target.value)}
            className="appearance-none border border-line bg-panel py-1.5 pr-6 pl-2.5 text-[11.5px] text-ink transition-colors duration-150 focus:border-accent focus:outline-none"
          >
            {LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.native}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-ink-3"
            width="10"
            height="10"
            viewBox="0 0 12 12"
            aria-hidden
          >
            <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </div>

        <button
          type="button"
          onClick={onToggleTheme}
          title={theme === 'dark' ? t('theme.switch') : t('theme.switchBack')}
          aria-label={theme === 'dark' ? t('theme.switch') : t('theme.switchBack')}
          className="flex h-[30px] w-[30px] shrink-0 items-center justify-center border border-line text-ink-3 transition-colors duration-150 hover:bg-panel-3 hover:text-ink focus-visible:ring-1 focus-visible:ring-accent focus-visible:outline-none"
        >
          {theme === 'dark' ? <Sun size={14} weight="regular" aria-hidden /> : <Moon size={14} weight="regular" aria-hidden />}
        </button>

        <nav className="flex shrink-0 border border-line" aria-label="View">
          {[
            ['map', t('view.overview'), true],
            ['report', t('view.report'), reportEnabled],
          ].map(([id, label, enabled], i) => (
            <button
              key={id}
              type="button"
              onClick={() => enabled && onViewChange?.(id)}
              disabled={!enabled}
              aria-current={view === id ? 'page' : undefined}
              className={`px-3 py-1.5 text-[11.5px] font-medium transition-colors duration-150 focus-visible:ring-1 focus-visible:ring-accent focus-visible:outline-none disabled:cursor-not-allowed disabled:text-ink-3/50 ${
                i > 0 ? 'border-l border-line' : ''
              } ${view === id ? 'bg-accent-soft text-ink' : 'text-ink-3 hover:text-ink-2'}`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}