import api from './api.js';
import { reportError } from '@/utils/errorReporter';

export async function getSystemMetrics() {
  try {
    const response = await api.get('/system/metrics');
    if (response.data?.success === false) {
      throw new Error(response.data.message || 'Failed to load system metrics');
    }
    return response.data?.data ?? {};
  } catch (error) {
    reportError(error, { context: 'system.metrics' });
    return null;
  }
}
