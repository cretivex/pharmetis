import api from './api.js';
import { reportError } from '@/utils/errorReporter';

export const getRFQResponses = async (rfqId = null) => {
  const params = rfqId ? { rfqId } : {};
  const response = await api.get('/rfq-responses', { params });
  return response.data?.data || response.data || [];
};

export const getRFQResponseById = async (id) => {
  const response = await api.get(`/rfq-responses/${id}`);
  return response.data?.data || response.data;
};

export const acceptRFQResponse = async (id) => {
  const response = await api.patch(`/rfq-responses/${id}/accept`);
  return response.data?.data || response.data;
};

export const rejectRFQResponse = async (id) => {
  const response = await api.patch(`/rfq-responses/${id}/reject`);
  return response.data?.data || response.data;
};

export const updateRFQResponse = async (id, data) => {
  const response = await api.patch(`/rfq-responses/${id}`, data);
  return response.data?.data || response.data;
};

export const reviewQuotation = async (id, action, adminNotes) => {
  // action should be 'APPROVE' or 'REJECT'
  const response = await api.patch(`/rfq-responses/${id}/review`, {
    action: action === 'APPROVE' || action === 'APPROVED' ? 'APPROVE' : 'REJECT',
    adminNotes
  });
  return response.data?.data || response.data;
};

export const sendQuotationToBuyer = async (id, editedData = null) => {
  try {
    const response = await api.post(`/rfq-responses/${id}/send-to-buyer`, editedData);
    return response.data?.data || response.data;
  } catch (error) {
    reportError(error, { context: 'quotations.sendToBuyer' });
    throw error;
  }
};

export const sendBackToSupplier = async (id) => {
  const response = await api.post(`/rfq-responses/${id}/send-back-to-supplier`);
  return response.data?.data || response.data;
};

export const sendNegotiationToSupplier = async (id) => {
  const response = await api.post(`/rfq-responses/${id}/send-negotiation-to-supplier`);
  return response.data?.data || response.data;
};
