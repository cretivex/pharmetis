import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const KEY = 'pharmetis_cookie_consent_v1'

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setVisible(true)
    } catch {
      setVisible(true)
    }
  }, [])

  const accept = () => {
    try {
      localStorage.setItem(KEY, 'accepted')
    } catch {
      /* ignore */
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-label="Cookie notice"
      className="fixed bottom-0 left-0 right-0 z-[100] border-t border-slate-200 bg-white/95 p-4 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-md md:p-5"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-6">
        <p className="text-sm text-slate-700">
          We use essential cookies to run the site and optional analytics to improve it. See our{' '}
          <Link to="/privacy" className="font-medium text-blue-600 underline hover:text-blue-800">
            Privacy Policy
          </Link>
          .
        </p>
        <button
          type="button"
          onClick={accept}
          className="shrink-0 rounded-full bg-[#050b1d] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Accept
        </button>
      </div>
    </div>
  )
}
