import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import App from './App.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import { AuthProvider } from './auth'
import { LanguageProvider } from './i18n'

/** Restore the scroll position on navigation, as a single-page app should. */
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function Root() {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            {/* future: password reset lives with the backend team's flow */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  )
}
