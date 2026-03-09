import api from '../config/api.js';

export const rfqService = {
  async create(rfqData) {
    const response = await api.post('/buyer/rfqs', rfqData);
    // Backend returns { success, message, data: rfq }
    // api.post returns the full response, so extract data field
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    return response.data?.data || response.data || response;
  },

  async getAll(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const queryString = params.toString();
    const endpoint = `/buyer/rfqs${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(endpoint);
    
    if (response.data && response.data.success) {
      return Array.isArray(response.data.data) ? response.data.data : [];
    }
    return [];
  },

  async getById(id) {
    const response = await api.get(`/buyer/rfqs/${id}`);
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    return response.data?.data || response.data || response;
  },

  async update(id, data) {
    const response = await api.patch(`/rfqs/${id}`, data);
    // Backend returns { success, message, data: rfq }
    return response.data?.data || response.data || response;
  },

  async delete(id) {
    const response = await api.delete(`/rfqs/${id}`);
    return response.data || response;
  },

  async processPayment(id, paymentData) {
    const response = await api.post(`/rfqs/${id}/pay`, paymentData);
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    return response.data?.data || response.data || response;
  },

  async acceptQuotation(quotationId) {
    const response = await api.post(`/buyer/quotations/${quotationId}/accept`);
    if (response.data && response.data.success) {
      return response.data.data || {};
    }
    return {};
  },

  async rejectQuotation(quotationId) {
    const response = await api.post(`/buyer/quotations/${quotationId}/reject`);
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    return response.data?.data || response.data || response;
  },

  async requestLowerPrice(quotationId, data) {
    const response = await api.post(`/buyer/quotations/${quotationId}/request-lower-price`, data);
    if (response.data && response.data.success && response.data.data) {
      return response.data.data;
    }
    return response.data?.data || response.data || response;
  }
};
