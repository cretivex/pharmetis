import api from './api.js';
import { reportError } from '@/utils/errorReporter';

export const getSystemSettings = async () => {
  try {
    const response = await api.get('/system-settings');
    
    if (response.data?.success === false) {
      throw new Error(response.data.message || 'Failed to load system settings');
    }
    
    return response.data?.data || response.data;
  } catch (error) {
    reportError(error, { context: 'system-settings.get' });
    
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Failed to load system settings');
    }
    
    throw error;
  }
};

export const updateSystemSettings = async (settingsData) => {
  try {
    const response = await api.patch('/system-settings', settingsData);
    
    if (response.data?.success === false) {
      throw new Error(response.data.message || 'Failed to update system settings');
    }
    
    return response.data?.data || response.data;
  } catch (error) {
    reportError(error, { context: 'system-settings.update' });
    
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Failed to update system settings');
    }
    
    throw error;
  }
};
