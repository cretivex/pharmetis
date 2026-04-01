import axios from 'axios'
import { setSupplierFlash } from '@/lib/flashStorage.js'

/**
 * Chrome DevTools: XHR/fetch only appear while the Network panel is open for that action.
 * Turn on "Preserve log" before navigating or the list clears on refresh.
 * Then filter "Fetch/XHR" and submit Login — you should see auth/login.
 */
const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout (increased for registration with email sending)
  withCredentials: true,
})

// Request interceptor to handle FormData
api.interceptors.request.use(
  (config) => {
    // If data is FormData, remove Content-Type to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 if not already on login page
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      setSupplierFlash(
        'warning',
        'Your session expired. Please sign in again.'
      )
      window.location.href = '/supplier/login'
    }
    if (
      import.meta.env.DEV &&
      (error.code === 'ERR_NETWORK' || error.message === 'Network Error')
    ) {
      console.warn('Network error — is the API running?', API_URL)
    }
    return Promise.reject(error)
  }
)

export default api
