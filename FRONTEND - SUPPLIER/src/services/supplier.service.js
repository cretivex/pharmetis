import api from './api.js'

export const getSupplierProfile = async () => {
  const response = await api.get('/suppliers/me')
  return response.data?.data || response.data || null
}

export const updateSupplierProfile = async (payload) => {
  const response = await api.patch('/suppliers/me', payload)
  return response.data
}

export const uploadSupplierLogo = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  const response = await api.post('/upload/vendors', formData)
  return response.data?.url || response.data?.data?.url || null
}

