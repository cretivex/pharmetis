import api from '../config/api.js';

export const notificationsService = {
  /**
   * Get all notifications for the current user
   */
  async getAll(options = {}) {
    const { limit = 50, offset = 0, unreadOnly = false } = options;
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit);
    if (offset) params.append('offset', offset);
    if (unreadOnly) params.append('unreadOnly', 'true');

    const response = await api.get(`/notifications?${params.toString()}`);
    return response.data?.data || response.data;
  },

  /**
   * Get unread notification count
   */
  async getUnreadCount() {
    const response = await api.get('/notifications/unread-count');
    return response.data?.data?.unreadCount || 0;
  },

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId) {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data?.data || response.data;
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    const response = await api.patch('/notifications/read-all');
    return response.data?.data || response.data;
  },

  /**
   * Delete a notification
   */
  async delete(notificationId) {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  }
};
