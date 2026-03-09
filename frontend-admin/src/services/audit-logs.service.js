import api from './api.js';

export async function getAuditLogs(params = {}) {
  const response = await api.get('/admin/audit-logs', { params });
  const payload = response.data ?? {};
  return {
    logs: Array.isArray(payload.data) ? payload.data : [],
    pagination: payload.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0 },
  };
}

export async function getAuditLogMeta() {
  const response = await api.get('/admin/audit-logs/meta');
  const data = response.data?.data || response.data;
  return data || { actions: [], resources: [] };
}
