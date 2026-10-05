import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { DICTIONARIES, DEFAULT_LANG } from './translations'

const STORAGE_KEY = 'lmis-lang'
const LanguageContext = createContext(null)

function readInitial() {
  if (typeof window === 'undefined') return DEFAULT_LANG
  const stored = localStorage.getItem(STORAGE_KEY)
  return DICTIONARIES[stored] ? stored : DEFAULT_LANG
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(readInitial)

  const setLanguage = useCallback((next) => {
    if (!DICTIONARIES[next]) return
    setLang(next)
    localStorage.setItem(STORAGE_KEY, next)
    document.documentElement.lang = next
  }, [])

  const t = useCallback(
    (key, vars) => {
      const dict = DICTIONARIES[lang] || DICTIONARIES[DEFAULT_LANG]
      let out = dict[key] ?? DICTIONARIES[DEFAULT_LANG][key] ?? key
      if (vars) {
        for (const [k, v] of Object.entries(vars)) out = out.replaceAll(`{${k}}`, String(v))
      }
      return out
    },
    [lang],
  )

  const value = useMemo(() => ({ lang, setLanguage, t }), [lang, setLanguage, t])

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used inside LanguageProvider')
  return ctx
}
