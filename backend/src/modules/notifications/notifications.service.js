import prisma from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'SUPPORT_ADMIN', 'READ_ONLY_ADMIN'];
const ADMIN_ONLY_NOTIFICATION_TYPES = new Set([
  'RFQ_CREATED',
  'SUPPLIER_SUBMITTED',
  'BUYER_ACCEPTED',
  'BUYER_REQUESTED_LOWER_PRICE',
  'SUPPLIER_COUNTER_OFFER',
  'ADMIN_ALERT'
]);

const isAdminRole = (role) => ADMIN_ROLES.includes(role);

/**
 * Create notifications for all admin users (so they appear in admin dashboard).
 * Uses userId per admin – GET /notifications returns notifications for the logged-in user.
 */
export const createAdminNotifications = async ({ title, message, link = null, type = 'ADMIN_ALERT' }) => {
  try {
    const adminUsers = await prisma.user.findMany({
      where: {
        role: { in: ADMIN_ROLES },
        deletedAt: null
      },
      select: { id: true }
    });
    if (adminUsers.length === 0) {
      logger.debug('No admin users to notify');
      return { count: 0 };
    }
    await prisma.notification.createMany({
      data: adminUsers.map((u) => ({
        userId: u.id,
        type,
        title,
        message,
        link,
        isRead: false
      }))
    });
    logger.info(`Created admin notifications: ${title} for ${adminUsers.length} admin(s)`);
    return { count: adminUsers.length };
  } catch (error) {
    logger.error('Create admin notifications error:', error);
    return { count: 0 };
  }
};

/**
 * Get all notifications for a user
 */
export const getNotificationsService = async (user, options = {}) => {
  try {
    const { limit = 50, offset = 0, unreadOnly = false } = options;
    const userId = user.id;
    const role = user.role;

    const baseWhere = {
      userId,
      ...(unreadOnly && { isRead: false })
    };

    // Defense-in-depth: buyers/suppliers should never receive admin-only broadcasts.
    const where = isAdminRole(role)
      ? baseWhere
      : {
          ...baseWhere,
          type: { notIn: Array.from(ADMIN_ONLY_NOTIFICATION_TYPES) }
        };

    const [notifications, totalCount, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit),
        skip: parseInt(offset)
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { ...where, isRead: false } })
    ]);

    return {
      notifications,
      pagination: {
        total: totalCount,
        unread: unreadCount,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    };
  } catch (error) {
    logger.error('Get notifications service error:', error);
    throw error;
  }
};

/**
 * Mark a notification as read
 */
export const markNotificationAsReadService = async (notificationId, userId) => {
  try {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    });

    if (!notification) {
      throw new ApiError(404, 'Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ApiError(403, 'You do not have permission to update this notification');
    }

    if (notification.isRead) {
      return notification; // Already read
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    logger.info(`Notification ${notificationId} marked as read by user ${userId}`);
    return updated;
  } catch (error) {
    logger.error('Mark notification as read service error:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read for a user
 */
export const markAllNotificationsAsReadService = async (userId) => {
  try {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    logger.info(`Marked ${result.count} notifications as read for user ${userId}`);
    return { count: result.count };
  } catch (error) {
    logger.error('Mark all notifications as read service error:', error);
    throw error;
  }
};

/**
 * Delete a notification
 */
export const deleteNotificationService = async (notificationId, userId) => {
  try {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    });

    if (!notification) {
      throw new ApiError(404, 'Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ApiError(403, 'You do not have permission to delete this notification');
    }

    await prisma.notification.delete({
      where: { id: notificationId }
    });

    logger.info(`Notification ${notificationId} deleted by user ${userId}`);
    return { success: true };
  } catch (error) {
    logger.error('Delete notification service error:', error);
    throw error;
  }
};

/**
 * Get unread notification count
 */
export const getUnreadCountService = async (user) => {
  try {
    const userId = user.id;
    const role = user.role;
    const where = isAdminRole(role)
      ? { userId, isRead: false }
      : {
          userId,
          isRead: false,
          type: { notIn: Array.from(ADMIN_ONLY_NOTIFICATION_TYPES) }
        };

    const count = await prisma.notification.count({
      where
    });

    return { unreadCount: count };
  } catch (error) {
    logger.error('Get unread count service error:', error);
    throw error;
  }
};
