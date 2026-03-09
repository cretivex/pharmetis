import api from './api.js'

export const registerSupplier = async (data) => {
  const response = await api.post('/suppliers/register', data)
  return response.data
}

export const loginSupplier = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password })
    const token = response.data?.data?.token || 
                  response.data?.data?.accessToken || 
                  response.data?.token
    if (token) {
      localStorage.setItem('supplierToken', token)
    } else {
      console.warn('No token received in login response:', response.data)
    }
    return response.data
  } catch (error) {
    console.error('Login API error:', error)
    throw error
  }
}

export const logoutSupplier = () => {
  localStorage.removeItem('supplierToken')
  localStorage.removeItem('supplierRefreshToken')
}

export const verifySupplierOTP = async (email, otpCode) => {
  const response = await api.post('/suppliers/verify-otp', { email, otpCode })
  return response.data
}

export const resendSupplierOTP = async (email) => {
  const response = await api.post('/suppliers/resend-otp', { email })
  return response.data
}

export const getCurrentSupplier = async () => {
  try {
    const response = await api.get('/suppliers/me')
    return response.data?.data || response.data || null
  } catch (error) {
    console.error('[getCurrentSupplier] Error:', error)
    console.error('[getCurrentSupplier] Error Response:', error.response?.data)
    throw error
  }
}

/** Send 6-digit OTP to email for password reset */
export const sendResetOtpSupplier = async (email) => {
  const response = await api.post('/suppliers/auth/send-reset-otp', { email })
  return response.data
}

/** Reset password with OTP (email + 6-digit OTP + new password) */
export const resetPasswordSupplier = async (email, otp, newPassword, confirmPassword) => {
  const response = await api.post('/suppliers/auth/reset-password', {
    email,
    otp,
    newPassword,
    confirmPassword
  })
  return response.data
}
