import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthShell from '../components/AuthShell'
import { AuthError, AuthField, AuthSubmit } from '../components/AuthField'
import { useAuth } from '../auth'
import { SEED_ACCOUNTS } from '../auth/credentials'
import { useLang } from '../i18n'

export default function Login() {
  const { t } = useLang()
  const { login } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await login({ email, password })
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  function useAccount(account) {
    setEmail(account.email)
    setPassword(account.password)
    setError('')
  }

  return (
    <AuthShell
      title={t('auth.title')}
      subtitle={t('auth.subtitle')}
      footer={
        <p className="text-[12px] text-ink-2">
          {t('auth.toSignup')}{' '}
          <Link to="/signup" className="text-accent hover:underline focus-visible:ring-1 focus-visible:ring-accent focus-visible:outline-none">
            {t('auth.signUp')}
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <AuthField label={t('auth.email')} type="email" autoComplete="email" value={email} onChange={setEmail} />
        <AuthField
          label={t('auth.password')}
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
        />

        <AuthError message={error} />
        <AuthSubmit busy={busy}>{t('auth.submit')}</AuthSubmit>
      </form>

      <section className="mt-10 border-t border-line pt-5">
        <h2 className="text-[10px] font-medium tracking-[0.06em] text-ink-3 uppercase">{t('auth.demoTitle')}</h2>
        <p className="mt-1.5 text-[11.5px] leading-relaxed text-ink-3">{t('auth.demoBody')}</p>

        <ul className="mt-4 divide-y divide-line-soft border-y border-line-soft">
          {SEED_ACCOUNTS.map((a) => (
            <li key={a.email} className="flex items-center justify-between gap-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-[12px] text-ink">{a.email}</p>
                <p className="truncate text-[10.5px] text-ink-3">
                  {a.name} · {a.organisation}
                </p>
              </div>
              <button
                type="button"
                onClick={() => useAccount(a)}
                className="shrink-0 border border-line px-2 py-1 text-[10.5px] text-ink-2 transition-colors duration-150 hover:border-accent hover:text-ink focus-visible:ring-1 focus-visible:ring-accent focus-visible:outline-none"
              >
                {t('auth.useAccount')}
              </button>
            </li>
          ))}
        </ul>

        <Link
          to="/"
          className="mt-4 block text-center text-[11.5px] text-ink-3 transition-colors duration-150 hover:text-ink focus-visible:ring-1 focus-visible:ring-accent focus-visible:outline-none"
        >
          {t('auth.guest')}
        </Link>
      </section>
    </AuthShell>
  )
}