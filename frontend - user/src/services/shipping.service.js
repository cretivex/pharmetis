import api from '../config/api.js'

export const shippingService = {
  async getEstimate(params = {}) {
    const response = await api.get('/shipping/estimate', { params })
    return response.data?.data ?? response.data
  },
}
