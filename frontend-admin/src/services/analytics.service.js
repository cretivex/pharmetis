import api from './api.js';
import { reportError } from '@/utils/errorReporter';

export const getAnalytics = async () => {
  try {
    const response = await api.get('/analytics');
    
    if (response.data?.success === false) {
      throw new Error(response.data.message || 'Failed to load analytics data');
    }
    
    return response.data?.data || response.data;
  } catch (error) {
    reportError(error, { context: 'analytics' });
    
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Failed to load analytics data');
    }
    
    throw error;
  }
};
