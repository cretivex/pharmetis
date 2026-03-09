import api from './api.js';

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
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminRefreshToken');
  window.location.href = '/login';
};

export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data?.data || response.data;
};
