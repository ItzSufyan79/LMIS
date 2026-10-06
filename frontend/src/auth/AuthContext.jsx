import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { loadSession, login as loginRequest, signOut as signOutRequest, signup as signupRequest } from './authApi'
import { PRIVILEGED_ROLES } from './credentials'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => loadSession())

  const login = useCallback(async (creds) => {
    const next = await loginRequest(creds)
    setSession(next)
    return next
  }, [])

  const signup = useCallback(async (payload) => {
    const next = await signupRequest(payload)
    setSession(next)
    return next
  }, [])

  const signOut = useCallback(() => {
    signOutRequest()
    setSession(null)
  }, [])

  const user = session?.user ?? null

  const value = useMemo(
    () => ({
      user,
      session,
      isAuthenticated: Boolean(session),
      isDemo: session?.source === 'demo',
      isPrivileged: Boolean(user && PRIVILEGED_ROLES.includes(user.role)),
      login,
      signup,
      signOut,
    }),
    [session, user, login, signup, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
