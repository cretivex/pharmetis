import api from './api.js';
import { logError } from '@/lib/observability';

export const getDashboardStats = async () => {
  try {
    const response = await api.get('/dashboard/stats');
    if (response.data?.success === false) {
      throw new Error(response.data.message || 'Failed to load dashboard stats');
    }
    return response.data?.data || response.data;
  } catch (error) {
    logError(error, { context: 'dashboard_stats' });
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Failed to load dashboard stats');
    }
    throw error;
  }
};

export const getDashboardCounts = async () => {
  try {
    const response = await api.get('/dashboard/counts');
    if (response.data?.success === false) {
      throw new Error(response.data.message || 'Failed to load dashboard counts');
    }
    return response.data?.data || { rfqs: 0, quotations: 0, suppliers: 0 };
  } catch (error) {
    logError(error, { context: 'dashboard_counts' });
    return { rfqs: 0, quotations: 0, orders: 0, suppliers: 0 };
  }
};

export const getDashboardMonitoring = async () => {
  try {
    const response = await api.get('/dashboard/monitoring');
    if (response.data?.success === false) {
      throw new Error(response.data.message || 'Failed to load monitoring');
    }
    return response.data?.data || {
      userActivityCount: 0,
      pendingApprovals: 0,
      systemLoad: 0,
      errorRate: 0,
      dbConnectionCount: 0,
      authFailures24h: 0,
    };
  } catch (error) {
    logError(error, { context: 'dashboard_monitoring' });
    return {
      userActivityCount: 0,
      pendingApprovals: 0,
      systemLoad: 0,
      errorRate: 0,
      dbConnectionCount: 0,
      authFailures24h: 0,
    };
  }
};
