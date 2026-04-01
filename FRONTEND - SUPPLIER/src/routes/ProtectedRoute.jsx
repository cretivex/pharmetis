import { useState, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { getCurrentSupplier } from '@/services/auth.service'
import { logoutSupplier } from '@/services/auth.service'

const LOGIN_PATH = '/supplier/login'

/**
 * Protects routes for VENDOR role only.
 * Requires an active cookie session and successful /suppliers/me.
 */
export default function ProtectedRoute({ children }) {
  const location = useLocation()
  const [gate, setGate] = useState({ kind: 'loading' })

  useEffect(() => {
    getCurrentSupplier()
      .then(() => setGate({ kind: 'ok' }))
      .catch((err) => {
        const status = err.response?.status
        if (status === 401 || status === 403) {
          logoutSupplier()
          const message =
            status === 403
              ? 'This account cannot access the supplier portal. Sign in with a vendor account.'
              : 'Your session is invalid or expired. Please sign in again.'
          setGate({
            kind: 'redirect',
            flash: {
              message,
              toastVariant: status === 403 ? 'error' : 'warning',
            },
          })
          return
        }
        setGate({
          kind: 'redirect',
          flash: {
            message: 'Unable to verify your account. Please try signing in again.',
            toastVariant: 'error',
          },
        })
      })
  }, [])

  if (gate.kind === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background text-muted-foreground">
        <Loader2 className="h-9 w-9 animate-spin text-primary" aria-hidden />
        <p className="text-sm text-foreground/80">Checking your session…</p>
      </div>
    )
  }

  if (gate.kind === 'redirect') {
    return (
      <Navigate
        to={LOGIN_PATH}
        replace
        state={{
          from: location.pathname,
          message: gate.flash.message,
          toastVariant: gate.flash.toastVariant,
        }}
      />
    )
  }

  return children
}
