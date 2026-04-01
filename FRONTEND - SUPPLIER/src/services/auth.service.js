import api from './api.js'
import { getSupplierProfile } from './supplier.service.js'

export const registerSupplier = async (data) => {
  const response = await api.post('/suppliers/register', data)
  return response.data
}

export const loginSupplier = async (email, password) => {
  const response = await fetch('/api/auth/supplier/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      email,
      password,
      expectedRole: 'VENDOR',
    }),
  })

  const data = await response.json().catch(() => ({}))
  console.log('Supplier login response:', data)

  if (!response.ok) {
    const error = new Error(data?.message || 'Login failed')
    error.response = { status: response.status, data }
    throw error
  }

  return data
}

export const logoutSupplier = () => {
  window.location.href = '/supplier/login'
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
  return getSupplierProfile()
}

export const sendResetOtpSupplier = async (email) => {
  const response = await api.post('/auth/forgot-password', { email })
  return response.data
}

export const resetPasswordSupplier = async (token, newPassword, confirmPassword) => {
  const response = await api.post('/auth/reset-password', {
    token,
    newPassword,
    confirmPassword
  })
  return response.data
}
