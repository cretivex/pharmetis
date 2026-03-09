import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AppRoutes } from '@/routes'
import ErrorBoundary from '@/components/ErrorBoundary'

const THEME_KEY = 'vendor-theme'

function initTheme() {
  const stored = localStorage.getItem(THEME_KEY)
  const dark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.remove('light', 'dark')
  document.documentElement.classList.add(dark ? 'dark' : 'light')
}

export default function App() {
  useEffect(() => {
    initTheme()
  }, [])

  return (
    <ErrorBoundary>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AppRoutes />
      </BrowserRouter>
    </ErrorBoundary>
  )
}
