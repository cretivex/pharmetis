import { useState, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getCurrentSupplier } from '@/services/auth.service'
import { logoutSupplier } from '@/services/auth.service'

const LOGIN_PATH = '/supplier/login'

/**
 * Protects routes for VENDOR role only.
 * Requires valid supplier token and successful /suppliers/me (vendor has supplier profile).
 */
export default function ProtectedRoute({ children }) {
  const location = useLocation()
  const [status, setStatus] = useState('pending') // 'pending' | 'allowed' | 'forbidden'

  useEffect(() => {
    const token = localStorage.getItem('supplierToken')
    if (!token) {
      setStatus('forbidden')
      return
    }

    getCurrentSupplier()
      .then(() => setStatus('allowed'))
      .catch((err) => {
        if (err.response?.status === 401 || err.response?.status === 403) {
          logoutSupplier()
        }
        setStatus('forbidden')
      })
  }, [])

  if (status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (status === 'forbidden') {
    return <Navigate to={LOGIN_PATH} state={{ from: location.pathname }} replace />
  }

  return children
}
