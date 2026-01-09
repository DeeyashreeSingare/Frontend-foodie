import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSocket } from '../services/socket';
import { useAuth } from './AuthContext';
import { orderAPI } from '../services/api';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  let authContext;
  try {
    authContext = useAuth();
  } catch (error) {
    console.error('Error getting auth context:', error);
    // Return children without socket functionality if auth fails
    return <>{children}</>;
  }

  const { isAuthenticated, user, loading } = authContext;
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState(() => {
    // Load notifications from localStorage if available
    const saved = localStorage.getItem('notifications');
    return saved ? JSON.parse(saved) : [];
  });

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
  }, [notifications]);

  // Fetch all notifications from backend on mount
  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated || !isAuthenticated()) return;

    const fetchAllNotifications = async () => {
      try {
        const { notificationAPI } = await import('../services/api');
        const response = await notificationAPI.getAll();
        const fetchedNotifications = response.data || [];
        // Always update notifications, even if empty array
        if (Array.isArray(fetchedNotifications)) {
          setNotifications(fetchedNotifications);
          // Save to localStorage
          if (fetchedNotifications.length > 0) {
            localStorage.setItem('notifications', JSON.stringify(fetchedNotifications));
          } else {
            localStorage.removeItem('notifications');
          }
        }
      } catch (error) {
        console.error('Error fetching notifications in SocketContext:', error);
        // On error, set empty array
        setNotifications([]);
      }
    };

    fetchAllNotifications();
  }, [isAuthenticated, loading]);

  useEffect(() => {
    // Wait for auth to finish loading before checking authentication
    if (loading) return;
    if (!isAuthenticated || !isAuthenticated()) return;

    const socket = getSocket();
    if (!socket) {
      return;
    }

    // Listen for new notifications and save them
    socket.on('new_notification', (notification) => {
      setNotifications((prev) => {
        // Check if notification already exists
        const notificationId = notification._id || notification.id;
        const exists = prev.find(n => {
          const nId = n._id || n.id;
          return nId && notificationId && nId.toString() === notificationId.toString();
        });
        if (exists) {
          return prev;
        }
        // Add new notification at the beginning
        const newNotification = {
          ...notification,
          _id: notification._id || notification.id,
          read: notification.read || false,
          createdAt: notification.createdAt || notification.created_at || new Date().toISOString()
        };
        const updated = [newNotification, ...prev];
        // Save to localStorage
        localStorage.setItem('notifications', JSON.stringify(updated));
        return updated;
      });
      // Show toast notification like Zomato
      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: { 
          message: notification.message || notification.title || 'New notification',
          type: notification.type || 'info'
        }
      }));
    });

    // Listen for order updates and show notifications
    socket.on('order_update', (orderData) => {
      // Show notification for status changes
      if (orderData.status) {
        const statusMessages = {
          'confirmed': 'Your order has been confirmed! 🎉',
          'preparing': 'Your order is being prepared 👨‍🍳',
          'ready': 'Your order is ready for pickup! 📦',
          'picked_up': 'Your order has been picked up! 🛵',
          'on_the_way': 'Your order is on the way! 🚀',
          'delivered': 'Your order has been delivered! ✅',
        };
        
        const message = statusMessages[orderData.status] || `Order #${orderData.id} status updated to ${orderData.status}`;
        
        window.dispatchEvent(new CustomEvent('app-toast', {
          detail: { 
            message: message,
            type: orderData.status === 'delivered' ? 'success' : 'info'
          }
        }));
      }
      
      setOrders((prevOrders) => {
        const index = prevOrders.findIndex((o) => o.id === orderData.id);
        if (index >= 0) {
          const updated = [...prevOrders];
          updated[index] = orderData;
          return updated;
        }
        return [...prevOrders, orderData];
      });
    });

    return () => {
      if (socket) {
        socket.off('order_update');
        socket.off('new_notification');
      }
    };
  }, [isAuthenticated, user, loading]);

  const updateOrderInState = (order) => {
    setOrders((prevOrders) => {
      const index = prevOrders.findIndex((o) => o.id === order.id);
      if (index >= 0) {
        const updated = [...prevOrders];
        updated[index] = order;
        return updated;
      }
      return [...prevOrders, order];
    });
  };

  const addOrderToState = (order) => {
    setOrders((prevOrders) => {
      if (prevOrders.find((o) => o.id === order.id)) {
        return prevOrders;
      }
      return [order, ...prevOrders];
    });
  };

  const removeNotification = (notificationId) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => {
        const nId = n._id || n.id;
        const notifId = notificationId._id || notificationId.id || notificationId;
        return nId && notifId && nId.toString() !== notifId.toString();
      });
      localStorage.setItem('notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const value = {
    orders,
    notifications,
    setOrders,
    setNotifications,
    updateOrderInState,
    addOrderToState,
    removeNotification,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};