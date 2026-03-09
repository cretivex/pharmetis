import api from '../config/api.js'

// Note: This service handles checkout flow - creating orders with delivery details

export const checkoutService = {
  async getQuotation(quotationId) {
    const response = await api.get(`/rfq-responses/${quotationId}`)
    return response.data?.data || response.data
  },

  async createOrder(quotationId, deliveryDetails) {
    const response = await api.post(`/checkout/${quotationId}`, deliveryDetails)
    return response.data?.data || response.data
  }
}
