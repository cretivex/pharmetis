import api from '../config/api.js'

export const searchService = {
  async search({ q, type = 'product' }) {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (type) params.set('type', type)
    const response = await api.get(`/search?${params.toString()}`)
    return response.data?.data ?? response.data
  },
}
