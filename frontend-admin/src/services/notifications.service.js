import api from './api.js';
import { logError } from '@/lib/observability';

/**
 * Get notifications for the logged-in admin user
 */
export const getNotifications = async (params = {}) => {
  try {
    const { limit = 50, offset = 0, unreadOnly = false } = params;
    const response = await api.get('/notifications', {
      params: { limit, offset, unreadOnly: unreadOnly ? 'true' : 'false' }
    });
    if (response.data?.success === false) {
      throw new Error(response.data.message || 'Failed to load notifications');
    }
    const data = response.data?.data || {};
    const list = data.notifications || [];
    const pagination = data.pagination || {};
    return {
      notifications: list,
      totalCount: pagination.total ?? 0,
      unreadCount: pagination.unread ?? 0
    };
  } catch (error) {
    logError(error, { context: 'get_notifications' });
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Failed to load notifications');
    }
    throw error;
  }
};

/**
 * Get unread notification count (for bell badge)
 */
export const getUnreadCount = async () => {
  try {
    const response = await api.get('/notifications/unread-count');
    if (response.data?.success === false) {
      return 0;
    }
    const data = response.data?.data || {};
    return data.unreadCount ?? 0;
  } catch (error) {
    logError(error, { context: 'get_unread_count' });
    return 0;
  }
};

/**
 * Mark a single notification as read
 */
export const markAsRead = async (notificationId) => {
  try {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    if (response.data?.success === false) {
      throw new Error(response.data.message || 'Failed to mark as read');
    }
    return response.data?.data;
  } catch (error) {
    logError(error, { context: 'mark_notification_read' });
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Failed to mark as read');
    }
    throw error;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async () => {
  try {
    const response = await api.patch('/notifications/read-all');
    if (response.data?.success === false) {
      throw new Error(response.data.message || 'Failed to mark all as read');
    }
    return response.data?.data;
  } catch (error) {
    logError(error, { context: 'mark_all_read' });
    if (error.response?.data) {
      throw new Error(error.response.data.message || 'Failed to mark all as read');
    }
    throw error;
  }
};
