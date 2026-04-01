import api from '../config/api.js';

export const suppliersService = {
  async getAll(filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.search) params.append('search', filters.search);
    if (filters.country) params.append('country', filters.country);
    if (filters.isVerified !== undefined) params.append('isVerified', filters.isVerified);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const queryString = params.toString();
    const endpoint = `/suppliers${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(endpoint);
    // Backend returns { success, message, data: { suppliers, pagination } }
    // api.get returns the full response, so extract data field
    return response.data || response;
  },

  async getBySlug(slug) {
    const response = await api.get(`/suppliers/slug/${slug}`);
    // Backend returns { success, message, data: supplier }
    return response.data?.data || response.data || response;
  },

  async getById(id) {
    const response = await api.get(`/suppliers/${id}`);
    // Backend returns { success, message, data: supplier }
    return response.data?.data || response.data || response;
  },

  async getProducts(supplierId, filters = {}) {
    const params = new URLSearchParams();
    
    if (filters.dosageForm) params.append('dosageForm', filters.dosageForm);
    if (filters.availability) params.append('availability', filters.availability);
    if (filters.search) params.append('search', filters.search);

    const queryString = params.toString();
    const endpoint = `/suppliers/${supplierId}/products${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.get(endpoint);
    // Backend returns { success, message, data: { products, pagination } }
    return response.data || response;
  }
};
