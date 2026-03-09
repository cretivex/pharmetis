import api from './api.js'

export const getMyProducts = async () => {
  const response = await api.get('/products/my')
  return response.data?.data || response.data
}

export const createProduct = async (data) => {
  try {
    const response = await api.post('/products', data)
    return response.data?.data || response.data
  } catch (err) {
    const message = err.response?.data?.message || err.message || 'Failed to create product'
    if (err.response?.status === 409) {
      throw new Error('A product with this name/slug already exists. Please use a different name.')
    }
    throw new Error(message)
  }
}

export const updateProduct = async (id, data) => {
  try {
    const response = await api.patch(`/products/${id}`, data)
    return response.data?.data || response.data
  } catch (err) {
    const message = err.response?.data?.message || err.message || 'Failed to update product'
    if (err.response?.status === 409) {
      throw new Error('A product with this name/slug already exists. Please use a different name.')
    }
    if (err.response?.status === 400) {
      throw new Error(err.response?.data?.message || 'Invalid data. Please check the form.')
    }
    throw new Error(message)
  }
}

/** Soft delete (backend sets deletedAt). */
export const deleteProduct = async (id) => {
  try {
    const response = await api.delete(`/products/${id}`)
    return response.data
  } catch (err) {
    const message = err.response?.data?.message || err.message || 'Failed to delete product'
    throw new Error(message)
  }
}

export const bulkUploadProducts = async (file) => {
  const formData = new FormData()
  formData.append('file', file) // MUST BE EXACTLY "file"
  
  console.log('[bulkUploadProducts] Uploading file:', file.name, file.size, 'bytes')
  console.log('[bulkUploadProducts] FormData entries:', Array.from(formData.entries()).map(([key, val]) => [key, val instanceof File ? `${val.name} (${val.size} bytes)` : val]))
  
  // DO NOT SET Content-Type header - let browser auto-set boundary
  const response = await api.post('/products/bulk-upload', formData, {
    timeout: 60000, // 60 seconds for bulk upload
  })
  
  console.log('[bulkUploadProducts] Upload response:', response.data)
  return response.data?.data || response.data
}
