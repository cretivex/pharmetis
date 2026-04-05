import api from '../config/api.js';

export const settingsService = {
  async uploadFile(type, file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/upload/${type}`, formData);
    return response.data?.url || response.data?.data?.url || null;
  },
  // Profile
  async getProfile() {
    const response = await api.get('/users/profile');
    return response.data?.data || response.data || response;
  },

  async updateProfile(profileData) {
    const response = await api.patch('/users/profile', profileData);
    return response.data?.data || response.data || response;
  },

  // Password
  async changePassword(currentPassword, newPassword) {
    const response = await api.post('/users/password/change', {
      currentPassword,
      newPassword
    });
    return response.data || response;
  },

  // Settings
  async getSettings() {
    const response = await api.get('/users/settings');
    return response.data?.data || response.data || response;
  },

  async updateSettings(settingsData) {
    const response = await api.patch('/users/settings', settingsData);
    return response.data?.data || response.data || response;
  },

  // Company Info
  async getCompanyInfo() {
    const response = await api.get('/users/company');
    return response.data?.data || response.data || response;
  },

  async updateCompanyInfo(companyData) {
    const response = await api.patch('/users/company', companyData);
    return response.data?.data || response.data || response;
  },

  // Addresses
  async getAddresses() {
    const response = await api.get('/users/addresses');
    return response.data?.data || response.data || [];
  },

  async getAddress(addressId) {
    const response = await api.get(`/users/addresses/${addressId}`);
    return response.data?.data || response.data || response;
  },

  async createAddress(addressData) {
    const response = await api.post('/users/addresses', addressData);
    return response.data?.data || response.data || response;
  },

  async updateAddress(addressId, addressData) {
    const response = await api.patch(`/users/addresses/${addressId}`, addressData);
    return response.data?.data || response.data || response;
  },

  async deleteAddress(addressId) {
    const response = await api.delete(`/users/addresses/${addressId}`);
    return response.data || response;
  },

  async setDefaultAddress(addressId) {
    const response = await api.patch(`/users/addresses/${addressId}/default`);
    return response.data?.data || response.data || response;
  },

  // Security
  async getSecuritySettings() {
    const response = await api.get('/users/security');
    return response.data?.data || response.data || response;
  },

  async updateOTPLoginPreference(enabled) {
    const response = await api.patch('/users/security/otp-preference', { enabled });
    return response.data?.data || response.data || response;
  },

  async logoutAllDevices() {
    const response = await api.post('/users/security/logout-all');
    return response.data || response;
  },

  async revokeSession(sessionId) {
    const response = await api.delete(`/users/security/sessions/${sessionId}`);
    return response.data || response;
  }
};
