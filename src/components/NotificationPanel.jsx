import React, { useState, useEffect } from 'react';
import { notificationAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';

const NotificationPanel = ({ onClose }) => {
  const { notifications, setNotifications, removeNotification } = useSocket();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    // Refresh notifications every 5 seconds
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getAll();
      const notificationsData = response.data || [];
      console.log('Fetched notifications in panel:', notificationsData);
      setNotifications(Array.isArray(notificationsData) ? notificationsData : []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationAPI.delete(id);
      removeNotification(id);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      className="card"
      style={{
        position: 'fixed',
        top: '70px',
        right: '20px',
        width: '400px',
        maxHeight: '500px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        overflow: 'hidden',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className="flex justify-between items-center p-4 border-b bg-gray-50">
        <h3 className="m-0 text-lg">Notifications {unreadCount > 0 && `(${unreadCount})`}</h3>
        <button onClick={onClose} className="btn btn-secondary text-xs px-2 py-1">
          Close
        </button>
      </div>

      <div className="overflow-y-auto max-h-[400px]">
        {loading ? (
          <div className="loading">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-secondary">
            No notifications
          </div>
        ) : (
          <div>
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 border-b hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50' : 'bg-white'
                  }`}
              >
                <div className="flex justify-between gap-3">
                  <div className="flex-1">
                    <strong className="block text-sm mb-1">{notification.title}</strong>
                    <p className="text-secondary text-sm mb-2">{notification.message}</p>
                    <small className="text-gray-400 text-xs">
                      {new Date(notification.created_at || notification.createdAt || Date.now()).toLocaleString()}
                    </small>
                  </div>
                  <div className="flex flex-col gap-2">
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification._id)}
                        className="btn btn-primary text-xs px-2 py-1 whitespace-nowrap"
                      >
                        Mark Read
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification._id)}
                      className="btn btn-danger text-xs px-2 py-1 whitespace-nowrap"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;