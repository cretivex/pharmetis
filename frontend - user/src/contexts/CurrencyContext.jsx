import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { formatPrice as formatPriceUtil } from '../utils/currency'
import api from '../config/api'

const CurrencyContext = createContext(null)

const EXCHANGE_RATES_KEY = 'app_exchange_rates'
const RATES_MAX_AGE_MS = 60 * 60 * 1000 // 1 hour

function loadStoredRates() {
  try {
    const raw = localStorage.getItem(EXCHANGE_RATES_KEY)
    if (!raw) return null
    const { rates, fetchedAt } = JSON.parse(raw)
    if (fetchedAt && Date.now() - fetchedAt < RATES_MAX_AGE_MS && rates) return rates
  } catch (_) {}
  return null
}

function saveRates(rates) {
  try {
    localStorage.setItem(
      EXCHANGE_RATES_KEY,
      JSON.stringify({ rates, fetchedAt: Date.now() })
    )
  } catch (_) {}
}

function getUserCountry() {
  try {
    const userStr = localStorage.getItem('user')
    if (!userStr) return null
    const user = JSON.parse(userStr)
    if (user?.country) return user.country
    const addr = user?.addresses?.[0] || user?.defaultAddress
    if (addr?.country) return addr.country
  } catch (_) {}
  return null
}

export function CurrencyProvider({ children }) {
  const [exchangeRates, setExchangeRates] = useState(loadStoredRates)
  const [userCountry, setUserCountry] = useState(getUserCountry)

  useEffect(() => {
    let cancelled = false
    const stored = loadStoredRates()
    if (stored) {
      setExchangeRates(stored)
    }

    const fetchRates = async () => {
      try {
        const { data } = await api.get('/exchange-rates')
        const payload = data?.data || data
        const rates = payload?.rates || payload
        if (rates && typeof rates === 'object' && !cancelled) {
          setExchangeRates(rates)
          saveRates(rates)
        }
      } catch (_) {
        if (!cancelled && !loadStoredRates()) {
          setExchangeRates({ USD: 1, INR: 83.12 })
        }
      }
    }
    fetchRates()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    setUserCountry(getUserCountry())
    const onStorage = () => setUserCountry(getUserCountry())
    window.addEventListener('storage', onStorage)
    window.addEventListener('loginStateChange', onStorage)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('loginStateChange', onStorage)
    }
  }, [])

  const formatPrice = useCallback(
    (amount, currency = 'USD') => {
      return formatPriceUtil(amount, currency, {
        exchangeRates: exchangeRates || {},
        userCountry
      })
    },
    [exchangeRates, userCountry]
  )

  const value = {
    exchangeRates: exchangeRates || {},
    userCountry,
    setUserCountry,
    formatPrice
  }

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) {
    throw new Error('useCurrency must be used within CurrencyProvider')
  }
  return ctx
}
