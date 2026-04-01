import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { notificationsService } from '../services/notifications.service.js';
// Helper function to format date (replaces date-fns)
const formatDistanceToNow = (date) => {
  const now = new Date();
  const diff = now - new Date(date);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  
  const months = Math.floor(days / 30);
  return `${months} month${months > 1 ? 's' : ''} ago`;
};

function NotificationDropdown({ isOpen, onClose, unreadCount, onCountChange }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [markingAsRead, setMarkingAsRead] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await notificationsService.getAll({ limit: 20 });
      const list = Array.isArray(result) ? result : (result?.notifications || []);
      setNotifications(list);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId, e) => {
    e.stopPropagation();
    try {
      setMarkingAsRead(notificationId);
      await notificationsService.markAsRead(notificationId);
      
      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId
            ? { ...notif, isRead: true, readAt: new Date() }
            : notif
        )
      );

      // Update unread count
      if (onCountChange) {
        const newCount = Math.max(0, unreadCount - 1);
        onCountChange(newCount);
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    } finally {
      setMarkingAsRead(null);
    }
  };

  const handleMarkAllAsRead = async (e) => {
    e.stopPropagation();
    try {
      setMarkingAsRead('all');
      await notificationsService.markAllAsRead();
      
      // Update local state
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true, readAt: new Date() }))
      );

      // Update unread count
      if (onCountChange) {
        onCountChange(0);
      }
    } catch (err) {
    } finally {
      setMarkingAsRead(null);
    }
  };

  const handleDelete = async (notificationId, e) => {
    e.stopPropagation();
    try {
      await notificationsService.delete(notificationId);
      
      // Update local state
      const deletedNotif = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));

      // Update unread count if deleted notification was unread
      if (deletedNotif && !deletedNotif.isRead && onCountChange) {
        const newCount = Math.max(0, unreadCount - 1);
        onCountChange(newCount);
      }
    } catch (err) {
    }
  };

  const handleNotificationClick = (notification) => {
    const normalizeNotificationLink = (rawLink) => {
      const link = String(rawLink || '').trim();
      if (!link) return '';

      // Backend notifications often use admin-oriented RFQ paths like /rfq/:id.
      // Map them to buyer routes in this app to avoid 404 (NotFound page).
      const rfqDetailMatch = link.match(/^\/rfq\/([^/?#]+)/i);
      if (rfqDetailMatch?.[1]) {
        return `/buyer/rfqs/${rfqDetailMatch[1]}`;
      }

      if (/^\/rfq\/new$/i.test(link)) {
        return '/send-rfq';
      }

      return link;
    };

    const targetLink = normalizeNotificationLink(notification.link);
    if (targetLink) {
      navigate(targetLink);
      onClose();
      
      // Mark as read if unread
      if (!notification.isRead) {
        handleMarkAsRead(notification.id, { stopPropagation: () => {} });
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-lg border border-blue-100 z-50 max-h-[600px] flex flex-col"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-blue-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            disabled={markingAsRead === 'all'}
            className="text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50 flex items-center gap-1"
          >
            {markingAsRead === 'all' ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <CheckCheck className="w-3 h-3" />
            )}
            Mark all as read
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <div className="p-4 text-center">
            <AlertCircle className="w-5 h-5 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-600">No notifications</p>
          </div>
        ) : (
          <div className="divide-y divide-blue-50">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`px-4 py-3 hover:bg-blue-50 transition-colors cursor-pointer ${
                  !notification.isRead ? 'bg-blue-50/50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className={`text-sm font-medium ${
                        !notification.isRead ? 'text-slate-900' : 'text-slate-700'
                      }`}>
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mb-2 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">
                        {formatDistanceToNow(notification.createdAt)}
                      </span>
                      <div className="flex items-center gap-2">
                        {!notification.isRead && (
                          <button
                            onClick={(e) => handleMarkAsRead(notification.id, e)}
                            disabled={markingAsRead === notification.id}
                            className="p-1 hover:bg-blue-100 rounded transition-colors disabled:opacity-50"
                            title="Mark as read"
                          >
                            {markingAsRead === notification.id ? (
                              <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
                            ) : (
                              <Check className="w-3 h-3 text-blue-600" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDelete(notification.id, e)}
                          className="p-1 hover:bg-red-100 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-3 border-t border-blue-100 text-center">
          <Link
            to="/notifications"
            onClick={onClose}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}

export default NotificationDropdown;
