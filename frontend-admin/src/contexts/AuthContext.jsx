import { createContext, useContext, useState, useCallback } from 'react'
import { getCurrentUser } from '@/services/auth.service'

const AuthContext = createContext(null)

const ADMIN_PANEL_ROLES = ['SUPER_ADMIN', 'ADMIN', 'SUPPORT_ADMIN', 'READ_ONLY_ADMIN']

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  const loadUser = useCallback(async () => {
    const data = await getCurrentUser()
    const u = data?.user ?? data
    setUser(u ?? null)
    return u
  }, [])

  const canAccess = useCallback((roleOrRoles) => {
    if (!user?.role) return false
    const allowed = Array.isArray(roleOrRoles) ? roleOrRoles : [roleOrRoles]
    return allowed.includes(user.role)
  }, [user?.role])

  const isReadOnlyAdmin = useCallback(() => user?.role === 'READ_ONLY_ADMIN', [user?.role])
  const canAccessSettings = useCallback(() =>
    !user || user.role === 'SUPER_ADMIN' || user.role === 'ADMIN',
  [user])

  const value = {
    user,
    setUser,
    loadUser,
    canAccess,
    isReadOnlyAdmin,
    canAccessSettings,
    adminRoles: ADMIN_PANEL_ROLES,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
