import api from './api.js';
import { encryptLoginPayload } from '@/utils/authCrypto';

// OTP-based login functions
export const requestOTP = async (email) => {
  const response = await api.post('/auth/request-otp', { email });
  return response.data;
};

export const verifyOTP = async (email, otp) => {
  const response = await api.post('/auth/verify-otp', { email, otp });
  return response.data;
};

// Legacy login (kept for backward compatibility, but not used)
export const login = async (email, password) => {
  const encryptedData = encryptLoginPayload({ email, password });
  const response = await api.post('/auth/login', { data: encryptedData });
  return response.data;
};

export const logout = () => {
  window.location.href = '/login';
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data?.data || response.data;
};

export const forgotPassword = async (email) => {
  const response = await api.post('/auth/forgot-password', {
    email: String(email || '').trim().toLowerCase()
  });
  return response.data;
};

export const resetPassword = async (token, newPassword, confirmPassword) => {
  const response = await api.post('/auth/reset-password', {
    token,
    newPassword,
    confirmPassword
  });
  return response.data;
};
