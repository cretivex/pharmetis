import api from './api.js';

export const uploadImage = async (type, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post(`/upload/${type}`, formData, {
    headers: { 'Content-Type': undefined }
  });
  return response.data?.url || response.data?.data?.url;
};

export const getAllProducts = async (params = {}) => {
  const response = await api.get('/products', { params });
  // Backend returns { success: true, data: { products: [], pagination: {} } }
  const data = response.data?.data || response.data;
  return data || { products: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
};

export const getProductById = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data?.data || response.data;
};

export const createProduct = async (data) => {
  const response = await api.post('/products', data);
  return response.data?.data || response.data;
};

export const updateProduct = async (id, data) => {
  const response = await api.patch(`/products/${id}`, data);
  return response.data?.data || response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

export const bulkUploadProducts = async (file, supplierId = null) => {
  const formData = new FormData();
  formData.append('file', file);
  if (supplierId) {
    formData.append('supplierId', supplierId);
  }
  
  const response = await api.post('/products/bulk-upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data?.data || response.data;
};
