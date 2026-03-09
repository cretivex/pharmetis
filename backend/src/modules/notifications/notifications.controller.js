import {
  getNotificationsService,
  markNotificationAsReadService,
  markAllNotificationsAsReadService,
  deleteNotificationService,
  getUnreadCountService
} from './notifications.service.js';
import { logger } from '../../utils/logger.js';

/**
 * Get all notifications for the authenticated user
 */
export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit, offset, unreadOnly } = req.query;

    const result = await getNotificationsService(userId, {
      limit: limit || 50,
      offset: offset || 0,
      unreadOnly: unreadOnly === 'true'
    });

    res.status(200).json({
      success: true,
      message: 'Notifications retrieved successfully',
      data: result
    });
  } catch (error) {
    logger.error('Get notifications controller error:', error);
    next(error);
  }
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await getUnreadCountService(userId);

    res.status(200).json({
      success: true,
      message: 'Unread count retrieved successfully',
      data: result
    });
  } catch (error) {
    logger.error('Get unread count controller error:', error);
    next(error);
  }
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await markNotificationAsReadService(id, userId);

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    logger.error('Mark notification as read controller error:', error);
    next(error);
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const result = await markAllNotificationsAsReadService(userId);

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      data: result
    });
  } catch (error) {
    logger.error('Mark all notifications as read controller error:', error);
    next(error);
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await deleteNotificationService(id, userId);

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    logger.error('Delete notification controller error:', error);
    next(error);
  }
};
