import api from './api.js';

export const getAllRFQs = async (params = {}) => {
  const response = await api.get('/rfqs', { params });
  // Backend returns { success: true, data: { rfqs: [], pagination: {} } }
  const data = response.data?.data || response.data;
  return data || { rfqs: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 0 } };
};

export const getRFQById = async (id) => {
  const response = await api.get(`/rfqs/${id}`);
  return response.data?.data || response.data;
};

export const updateRFQ = async (id, data) => {
  const response = await api.patch(`/rfqs/${id}`, data);
  return response.data?.data || response.data;
};

export const deleteRFQ = async (id) => {
  const response = await api.delete(`/rfqs/${id}`);
  return response.data;
};

export const sendRFQToSuppliers = async (rfqId, supplierIds) => {
  const response = await api.post(`/rfqs/${rfqId}/send`, { supplierIds });
  return response.data?.data || response.data;
};
