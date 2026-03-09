import api from './api.js';

export const getAllBuyers = async (params = {}) => {
  const response = await api.get('/admin/buyers', { params });
  const data = response.data?.data || response.data;
  return data || { buyers: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
};

export const getBuyerById = async (id) => {
  const response = await api.get(`/admin/buyers/${id}`);
  return response.data?.data || response.data;
};

export const getBuyerRFQs = async (id, params = {}) => {
  const response = await api.get(`/admin/buyers/${id}/rfqs`, { params });
  return response.data?.data || response.data;
};

export const getBuyerPayments = async (id, params = {}) => {
  const response = await api.get(`/admin/buyers/${id}/payments`, { params });
  return response.data?.data || response.data;
};

export const suspendBuyer = async (id) => {
  const response = await api.patch(`/admin/buyers/${id}/suspend`);
  return response.data?.data || response.data;
};

export const activateBuyer = async (id) => {
  const response = await api.patch(`/admin/buyers/${id}/activate`);
  return response.data?.data || response.data;
};
