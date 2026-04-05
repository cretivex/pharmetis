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
    if (filters.sort) params.append('sort', filters.sort);
    appendMulti('certification', filters.certification);
    if (filters.minPrice != null && filters.minPrice !== '') params.append('minPrice', String(filters.minPrice));
    if (filters.maxPrice != null && filters.maxPrice !== '') params.append('maxPrice', String(filters.maxPrice));
    if (filters.moq != null && filters.moq !== '') params.append('moq', String(filters.moq));
    if (filters.category) params.append('category', String(filters.category));
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const queryString = params.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;

    const response = await api.get(endpoint);
    const body = response.data;
    // Backend: { success, message, data: { products, pagination } }
    if (body && body.data != null && (body.data.products != null || body.data.pagination != null)) {
      return body.data;
    }
    return body;
  },

  /** Flat catalog response: { data, total, page, totalPages } */
  async getFilter(filters = {}) {
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
    appendMulti('certification', filters.certification);
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.minPrice != null && filters.minPrice !== '') params.append('minPrice', String(filters.minPrice));
    if (filters.maxPrice != null && filters.maxPrice !== '') params.append('maxPrice', String(filters.maxPrice));
    if (filters.moq != null && filters.moq !== '') params.append('moq', String(filters.moq));
    if (filters.category) params.append('category', String(filters.category));
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const queryString = params.toString();
    const response = await api.get(`/products/filter${queryString ? `?${queryString}` : ''}`);
    return response.data;
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
