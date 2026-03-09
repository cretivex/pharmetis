import api from './api.js';

export const getAllSuppliers = async (params = {}) => {
  const response = await api.get('/suppliers', { params });
  // Backend returns { success: true, data: { suppliers: [], pagination: {} } }
  const data = response.data?.data || response.data;
  return data || { suppliers: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
};

export const getSupplierById = async (id) => {
  const response = await api.get(`/suppliers/${id}`);
  return response.data?.data || response.data;
};

export const getSupplierBySlug = async (slug) => {
  const response = await api.get(`/suppliers/slug/${slug}`);
  return response.data?.data || response.data;
};

export const updateSupplier = async (id, data) => {
  const response = await api.patch(`/suppliers/${id}`, data);
  return response.data?.data || response.data;
};

export const approveSupplier = async (id) => {
  const response = await api.patch(`/suppliers/${id}`, { isVerified: true, isActive: true });
  return response.data?.data || response.data;
};

export const rejectSupplier = async (id) => {
  const response = await api.patch(`/suppliers/${id}`, { isVerified: false, isActive: false });
  return response.data?.data || response.data;
};

export const deleteSupplier = async (id) => {
  const response = await api.delete(`/suppliers/${id}`);
  return response.data;
};
