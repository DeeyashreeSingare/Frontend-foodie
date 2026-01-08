import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { getSocket } from '../services/socket';
import { orderAPI } from '../services/api';
import OrderStatus from '../components/OrderStatus';
import NotificationPanel from '../components/NotificationPanel';
import ToastNotification from '../components/ToastNotification';
import Navbar from '../components/Navbar';

const RiderDashboard = () => {
  const { user, logout } = useAuth();
  const { orders, setOrders, updateOrderInState, addOrderToState, notifications, setNotifications } = useSocket();
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('available');
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchData();
    fetchNotifications();
  }, []);

  // Listen for real-time notifications (including role-based)
  useEffect(() => {
    const socket = getSocket();
    
    if (!socket) return;

    const handleNewNotification = (notification) => {
      console.log('New notification received:', notification);
      setNotifications((prev) => {
        if (prev.find(n => n._id === notification._id)) {
          return prev;
        }
        return [notification, ...prev];
      });
      setToast({ message: notification.message, type: 'info' });
    };

    socket.on('new_notification', handleNewNotification);

    return () => {
      if (socket && socket.connected) {
        socket.off('new_notification', handleNewNotification);
      }
    };
  }, [setNotifications]);

  const fetchNotifications = async () => {
    try {
      const { notificationAPI } = await import('../services/api');
      const response = await notificationAPI.getAll();
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const fetchData = async () => {
    try {
      await Promise.all([fetchAvailableOrders(), fetchMyOrders()]);
    } catch (err) {
      console.error('Error fetching initial data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableOrders = async () => {
    try {
      const response = await orderAPI.getAvailable();
      setAvailableOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching available orders:', error);
      showToast('Failed to load available orders', 'error');
    }
  };

  const fetchMyOrders = async () => {
    try {
      const response = await orderAPI.getRiderOrders();
      const orders = response.data || [];
      setMyOrders(orders);
      // Update socket context
      orders.forEach((order) => addOrderToState(order));
    } catch (error) {
      console.error('Error fetching my orders:', error);
      showToast('Failed to load my orders', 'error');
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      const response = await orderAPI.acceptOrder(orderId);
      addOrderToState(response.data.order);
      setAvailableOrders(availableOrders.filter((o) => o.id !== orderId));
      setMyOrders([response.data.order, ...myOrders]);
      setActiveTab('my-orders');
      showToast('Order accepted successfully', 'success');
    } catch (error) {
      console.error('Error accepting order:', error);
      showToast(error.response?.data?.message || 'Failed to accept order', 'error');
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      const response = await orderAPI.updateRiderStatus(orderId, status);
      updateOrderInState(response.data.order);
      setMyOrders(
        myOrders.map((o) => (o.id === orderId ? response.data.order : o))
      );
      showToast(`Order marked as ${status.replace('_', ' ')}`, 'success');
    } catch (error) {
      console.error('Error updating order status:', error);
      showToast(error.response?.data?.message || 'Failed to update order status', 'error');
    }
  };

  const getAvailableStatuses = (currentStatus) => {
    switch (currentStatus) {
      case 'assigned':
      case 'confirmed':
      case 'preparing':
      case 'ready':
        return ['picked_up'];
      case 'picked_up':
        return ['delivered'];
      case 'on_the_way':
        return ['delivered']; // Fallback for existing orders
      default:
        return [];
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && (
        <ToastNotification
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <Navbar
        toggleNotifications={() => setShowNotifications(!showNotifications)}
        notificationCount={unreadCount}
      />

      {showNotifications && (
        <NotificationPanel onClose={() => setShowNotifications(false)} />
      )}

      <div className="container">
        {/* Tabs */}
        <div className="card mb-4 min-h-[500px]">
          <div className="flex gap-4 mb-6 border-b pb-4">
            <button
              className={`px-4 py-2 font-medium transition-colors ${activeTab === 'available'
                ? 'text-primary border-b-2 border-primary'
                : 'text-secondary hover:text-primary'
                }`}
              onClick={() => setActiveTab('available')}
            >
              Available Orders ({availableOrders.length})
            </button>
            <button
              className={`px-4 py-2 font-medium transition-colors ${activeTab === 'my-orders'
                ? 'text-primary border-b-2 border-primary'
                : 'text-secondary hover:text-primary'
                }`}
              onClick={() => setActiveTab('my-orders')}
            >
              My Orders ({myOrders.length})
            </button>
          </div>

          {/* Available Orders */}
          {activeTab === 'available' && (
            <div>
              <h2 className="mb-4">Available for Pickup</h2>
              {loading ? (
                <div className="loading">Loading availabilities...</div>
              ) : availableOrders.length === 0 ? (
                <div className="text-center py-12 text-secondary">
                  <p className="text-xl mb-2">No orders available right now</p>
                  <p>Check back later or wait for notifications</p>
                </div>
              ) : (
                <div className="grid">
                  {availableOrders
                    .map((order) => (
                      <div
                        key={order.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <strong className="text-lg">Order #{order.id}</strong>
                            <p className="text-secondary text-sm mt-1">
                              📍 {order.delivery_address}
                            </p>
                          </div>
                          <OrderStatus status={order.status} />
                        </div>

                        <div className="bg-gray-50 p-3 rounded mb-4">
                          <p className="font-bold mb-1">Items:</p>
                          <ul className="list-disc pl-5 text-sm text-secondary">
                            {order.items?.map((item, index) => (
                              <li key={index}>
                                {item.quantity}x {item.name}
                              </li>
                            ))}
                          </ul>
                          <div className="mt-2 pt-2 border-t border-gray-200 font-bold text-right">
                            Payout: ₹{(parseFloat(order.total_amount) * 0.2).toFixed(2)} {/* Mock payout */}
                          </div>
                        </div>

                        <button
                          className="btn btn-primary w-full"
                          onClick={() => handleAcceptOrder(order.id)}
                        >
                          Accept Delivery
                        </button>
                        <p className="text-xs text-center text-secondary mt-2">
                          {new Date(order.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* My Orders */}
          {activeTab === 'my-orders' && (
            <div>
              <h2 className="mb-4">My Deliveries</h2>
              {loading ? (
                <div className="loading">Loading your orders...</div>
              ) : myOrders.length === 0 ? (
                <div className="text-center py-12 text-secondary">
                  <p className="text-xl mb-2">No active deliveries</p>
                  <p>Go to the "Available Orders" tab to pick up a new order.</p>
                </div>
              ) : (
                <div className="grid">
                  {myOrders.map((order) => {
                    const availableStatuses = getAvailableStatuses(order.status);
                    return (
                      <div
                        key={order.id}
                        className="border rounded-lg p-4 bg-white shadow-sm"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <strong className="text-lg">Order #{order.id}</strong>
                            <p className="text-secondary text-sm mt-1">
                              📍 {order.delivery_address}
                            </p>
                          </div>
                          <OrderStatus status={order.status} />
                        </div>

                        <div className="mb-4">
                          <p className="font-bold">Customer Details:</p>
                          <p className="text-sm text-secondary">Total Amount: ₹{order.total_amount}</p>
                        </div>

                        {availableStatuses.length > 0 ? (
                          <div className="flex gap-2">
                            {availableStatuses.map((status) => (
                              <button
                                key={status}
                                className="btn btn-success w-full"
                                onClick={() => handleUpdateStatus(order.id, status)}
                              >
                                Mark as {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center p-2 bg-green-50 text-green-700 rounded">
                            Delivery Completed
                          </div>
                        )}

                        <p className="text-xs text-secondary mt-2 text-center">
                          Started: {new Date(order.created_at).toLocaleString()}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiderDashboard;