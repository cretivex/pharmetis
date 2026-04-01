import express from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification
} from './notifications.controller.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all notifications
router.get('/', getNotifications);

// Get unread count
router.get('/unread-count', getUnreadCount);

// Mark all as read
router.patch('/read-all', markAllNotificationsAsRead);

// Mark single notification as read
router.patch('/:id/read', markNotificationAsRead);

// Delete notification
router.delete('/:id', deleteNotification);

export default router;
