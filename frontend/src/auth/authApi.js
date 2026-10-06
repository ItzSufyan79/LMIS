import { API_BASE, SEED_ACCOUNTS } from './credentials'

const SESSION_KEY = 'lmis-session'

/**
 * Talks to the backend auth API.
 *
 * CONTRACT expected by the backend team
 * -------------------------------------
 * POST {API_BASE}/auth/login   { email, password }        -> 200 { token?, user }
 * POST {API_BASE}/auth/signup  { name, email, organisation, role, password } -> 200 { token?, user }
 * GET  {API_BASE}/auth/me                                 -> 200 { user }
 *
 * Either return a `token` (stored locally, sent as `Authorization: Bearer`)
 * or set an httpOnly session cookie — a cookie is the stronger option because
 * it is not readable by page scripts. Both are supported here.
 */

export class AuthError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'AuthError'
    this.status = status
  }
}

/**
 * Distinguishes "the backend is not deployed" from "the credentials were
 * rejected". Getting this wrong makes a missing API look like a wrong password,
 * which is exactly the bug this originally had.
 */
const UNAVAILABLE_STATUSES = new Set([404, 405, 501, 502, 503])

async function request(path, options) {
  let res
  try {
    res = await fetch(`${API_BASE}${path}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      ...options,
    })
  } catch {
    return { available: false }
  }

  if (UNAVAILABLE_STATUSES.has(res.status)) return { available: false }

  // A SPA host may answer unknown paths with index.html; that is not our API.
  const contentType = res.headers.get('content-type') || ''
  if (!contentType.includes('json')) return { available: false }

  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new AuthError(body.message || 'Something went wrong. Please try again.', res.status)
  }
  return { available: true, body }
}

function seededMatch(email, password) {
  return SEED_ACCOUNTS.find(
    (a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password,
  )
}

export function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveSession(session) {
  // Only the identity and token are persisted. The password is never stored.
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

export async function login({ email, password }) {
  const res = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) })

  if (res.available) {
    const session = { user: res.body.user, token: res.body.token ?? null, source: 'api' }
    saveSession(session)
    return session
  }

  // Offline / no backend: accept a seeded identity only.
  const account = seededMatch(email, password)
  if (!account) {
    throw new AuthError('No backend available, and those demo credentials do not match.', 0)
  }
  const session = {
    user: {
      email: account.email,
      name: account.name,
      organisation: account.organisation,
      role: account.role,
    },
    token: null,
    source: 'demo',
  }
  saveSession(session)
  return session
}

export async function signup({ name, email, organisation, role, password }) {
  const res = await request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, organisation, role, password }),
  })

  if (res.available) {
    const session = { user: res.body.user, token: res.body.token ?? null, source: 'api' }
    saveSession(session)
    return session
  }

  // No backend: create a local-only identity so the flow can be demonstrated.
  const session = {
    user: { email, name, organisation, role },
    token: null,
    source: 'demo',
  }
  saveSession(session)
  return session
}

export function signOut() {
  clearSession()
}
