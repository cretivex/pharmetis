import { useState, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getCurrentUser } from '@/services/auth.service'
import { logout } from '@/services/auth.service'
import { useAuth } from '@/contexts/AuthContext'

const LOGIN_PATH = '/login'
const UNAUTHORIZED_PATH = '/unauthorized'

const DEFAULT_ALLOWED_ROLES = ['SUPER_ADMIN', 'ADMIN', 'SUPPORT_ADMIN', 'READ_ONLY_ADMIN']

/**
 * Protects routes by role. Verifies token and user.role from backend.
 * @param {React.ReactNode} children
 * @param {string[]} allowedRoles - roles that can access (default: admin panel roles)
 */
export default function ProtectedRoute({ children, allowedRoles = DEFAULT_ALLOWED_ROLES }) {
  const location = useLocation()
  const { loadUser, setUser } = useAuth()
  const [status, setStatus] = useState('pending') // 'pending' | 'allowed' | 'forbidden' | 'unauthorized'

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      setStatus('forbidden')
      return
    }

    getCurrentUser()
      .then((data) => {
        const user = data?.user ?? data
        if (!user?.role) {
          setStatus('forbidden')
          return
        }
        setUser(user)
        if (allowedRoles.includes(user.role)) {
          setStatus('allowed')
        } else {
          setStatus('unauthorized')
        }
      })
      .catch(() => {
        setStatus('forbidden')
      })
  }, [allowedRoles, setUser])

  if (status === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (status === 'forbidden') {
    logout()
    return <Navigate to={LOGIN_PATH} state={{ from: location.pathname }} replace />
  }

  if (status === 'unauthorized') {
    return <Navigate to={UNAUTHORIZED_PATH} state={{ from: location.pathname }} replace />
  }

  return children
}
