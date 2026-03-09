import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { checkBuyerProfileCompletion } from '../utils/profileCompletion'
import { authService } from '../services/auth.service'
import { settingsService } from '../services/settings.service'

const ProfileCompletionContext = createContext(null)

export function ProfileCompletionProvider({ children }) {
  const location = useLocation()
  const [result, setResult] = useState({ complete: true, missingFields: [], percentage: 100 })
  const [loading, setLoading] = useState(false)
  const [isBuyer, setIsBuyer] = useState(false)

  const fetchAndCheck = useCallback(async () => {
    const user = authService.getCurrentUser()
    if (!user || user.role !== 'BUYER') {
      setIsBuyer(false)
      setResult({ complete: true, missingFields: [], percentage: 100 })
      return
    }
    setIsBuyer(true)
    setLoading(true)
    try {
      const [profileData, companyData, addressesData] = await Promise.all([
        settingsService.getProfile().catch(() => ({})),
        settingsService.getCompanyInfo().catch(() => ({})),
        settingsService.getAddresses().catch(() => [])
      ])
      const merged = {
        phone: profileData.phone,
        companyName: companyData.companyName,
        businessType: companyData.businessType,
        gstTaxId: companyData.gstTaxId,
        addresses: Array.isArray(addressesData) ? addressesData : []
      }
      const check = checkBuyerProfileCompletion(merged)
      setResult(check)
    } catch {
      setResult({ complete: true, missingFields: [], percentage: 100 })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      setIsBuyer(false)
      setResult({ complete: true, missingFields: [], percentage: 100 })
      return
    }
    fetchAndCheck()
  }, [fetchAndCheck])

  useEffect(() => {
    const onLoginChange = () => {
      if (authService.isAuthenticated()) fetchAndCheck()
      else setResult({ complete: true, missingFields: [], percentage: 100 })
    }
    window.addEventListener('storage', onLoginChange)
    window.addEventListener('loginStateChange', onLoginChange)
    return () => {
      window.removeEventListener('storage', onLoginChange)
      window.removeEventListener('loginStateChange', onLoginChange)
    }
  }, [fetchAndCheck])

  // Re-check when user leaves Settings (e.g. after completing profile)
  const prevPathRef = useRef(location.pathname)
  useEffect(() => {
    const wasOnSettings = prevPathRef.current.includes('/settings')
    prevPathRef.current = location.pathname
    if (wasOnSettings && !location.pathname.includes('/settings') && authService.isAuthenticated()) {
      fetchAndCheck()
    }
  }, [location.pathname, fetchAndCheck])

  const value = {
    ...result,
    loading,
    isBuyer,
    refresh: fetchAndCheck
  }

  return (
    <ProfileCompletionContext.Provider value={value}>
      {children}
    </ProfileCompletionContext.Provider>
  )
}

export function useProfileCompletion() {
  const ctx = useContext(ProfileCompletionContext)
  return ctx || { complete: true, missingFields: [], percentage: 100, loading: false, isBuyer: false, refresh: () => {} }
}
