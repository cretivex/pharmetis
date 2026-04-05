import api from '../config/api.js'

export const buyerPortalService = {
  async listOrders() {
    const response = await api.get('/buyer/orders')
    return response.data?.data ?? response.data ?? []
  },

  async listInvoices() {
    const response = await api.get('/buyer/invoices')
    return response.data?.data ?? response.data ?? []
  },
}
