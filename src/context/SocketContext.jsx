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
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Wait for auth to finish loading before checking authentication
    if (loading) return;
    if (!isAuthenticated || !isAuthenticated()) return;

    const socket = getSocket();
    if (!socket) return;

    // Listen for order updates
    socket.on('order_update', (orderData) => {
      console.log('Order update received:', orderData);
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

    // Listen for new notifications
    socket.on('new_notification', (notification) => {
      console.log('SocketContext - New notification received:', notification);
      setNotifications((prev) => {
        if (prev.find(n => n._id === notification._id)) {
          return prev;
        }
        return [notification, ...prev];
      });
      // Trigger a global custom event for toasts if needed, or handle here
      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: { message: notification.message, type: 'info' }
      }));
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
    setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
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