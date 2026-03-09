import api from '../config/api.js';

export const productsService = {
  async getAll(filters = {}) {
    const params = new URLSearchParams();

    if (filters.search) params.append('search', filters.search);
    const appendMulti = (key, values) => {
      const arr = Array.isArray(values) ? values : values ? [values] : [];
      arr.forEach((v) => v != null && v !== '' && params.append(key, v));
    };
    appendMulti('dosageForm', filters.dosageForm);
    appendMulti('availability', filters.availability);
    appendMulti('country', filters.country);
    appendMulti('therapeuticAreas', filters.therapeuticAreas);
    appendMulti('manufacturer', filters.manufacturer);
    appendMulti('categoryIds', filters.categoryIds);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const queryString = params.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;

    const response = await api.get(endpoint);
    return response.data || response;
  },

  async getBySlug(slug) {
    const response = await api.get(`/products/slug/${slug}`);
    // Backend returns { success, message, data: product }
    return response.data?.data || response.data || response;
  },

  async getById(id) {
    const response = await api.get(`/products/${id}`);
    // Backend returns { success, message, data: product }
    return response.data?.data || response.data || response;
  },

  async getFeatured() {
    const response = await api.get('/products/featured');
    // Backend returns { success, message, data: products[] }
    return response.data?.data || response.data || response;
  },

  async saveProduct(productId) {
    const response = await api.post('/products/save', { productId });
    // Backend returns { success, message, data: SavedProduct }
    return response.data?.data || response.data || response;
  },

  async unsaveProduct(productId) {
    const response = await api.delete(`/products/save/${productId}`);
    // Backend returns { success, message }
    return response.data || response;
  },

  async getSavedProducts() {
    const response = await api.get('/products/save');
    // Backend returns { success, message, data: products[] }
    return response.data?.data || response.data || response;
  }
};
