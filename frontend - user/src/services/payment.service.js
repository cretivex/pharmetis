import api from '../config/api.js';

export const paymentService = {
  /** Buyer payment history (paginated). */
  async list(params = {}) {
    const response = await api.get('/payments', { params });
    return response.data?.data ?? response.data;
  },

  async create(paymentData) {
    const response = await api.post('/payments/create', paymentData);
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    return response.data?.data || response.data || response;
  },

  async confirm(paymentId, data) {
    const response = await api.post(`/payments/confirm/${paymentId}`, data);
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    return response.data?.data || response.data || response;
  }
};
