import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthShell from '../components/AuthShell'
import { AuthError, AuthField, AuthSubmit } from '../components/AuthField'
import { useAuth } from '../auth'
import { ROLES } from '../auth/credentials'
import { useLang } from '../i18n'

const ROLE_LABEL_KEY = {
  recruiter: 'auth.roleRecruiter',
  employer: 'auth.roleEmployer',
  trainer: 'auth.roleTrainer',
  official: 'auth.roleOfficial',
  admin: 'auth.roleAdmin',
}

export default function Signup() {
  const { t } = useLang()
  const { signup } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: '',
    email: '',
    organisation: '',
    role: ROLES[0].id,
    password: '',
  })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (key) => (v) => setForm((f) => ({ ...f, [key]: v }))

  async function onSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      await signup(form)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthShell
      title={t('auth.signUp')}
      subtitle={t('auth.subtitle')}
      footer={
        <p className="text-[12px] text-ink-2">
          {t('auth.toSignin')}{' '}
          <Link to="/login" className="text-accent hover:underline focus-visible:ring-1 focus-visible:ring-accent focus-visible:outline-none">
            {t('auth.signIn')}
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <AuthField label={t('auth.name')} autoComplete="name" value={form.name} onChange={set('name')} />

        <AuthField label={t('auth.email')} type="email" autoComplete="email" value={form.email} onChange={set('email')} />

        <AuthField
          label={t('auth.organisation')}
          autoComplete="organization"
          value={form.organisation}
          onChange={set('organisation')}
        />

        <AuthField label={t('auth.role')} value={form.role} onChange={set('role')}>
          <select
            id="role"
            value={form.role}
            onChange={(e) => set('role')(e.target.value)}
            className="w-full appearance-none border border-line bg-panel px-2.5 py-2 text-[13px] text-ink transition-colors duration-150 focus:border-accent focus:outline-none"
          >
            {ROLES.map((r) => (
              <option key={r.id} value={r.id}>
                {t(ROLE_LABEL_KEY[r.id] ?? r.label)}
              </option>
            ))}
          </select>
        </AuthField>

        <AuthField
          label={t('auth.password')}
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={set('password')}
          hint="At least 8 characters."
        />

        <AuthError message={error} />
        <AuthSubmit busy={busy}>{t('auth.signUp')}</AuthSubmit>
      </form>

      <Link
        to="/"
        className="mt-10 block border-t border-line pt-5 text-center text-[11.5px] text-ink-3 transition-colors duration-150 hover:text-ink focus-visible:ring-1 focus-visible:ring-accent focus-visible:outline-none"
      >
        {t('auth.guest')}
      </Link>
    </AuthShell>
  )
}