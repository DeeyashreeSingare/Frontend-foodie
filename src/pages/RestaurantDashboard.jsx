import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { getSocket } from '../services/socket';
import { orderAPI, restaurantAPI } from '../services/api';
import OrderStatus from '../components/OrderStatus';
import ToastNotification from '../components/ToastNotification';
import Navbar from '../components/Navbar';
import RestaurantForm from '../components/RestaurantForm';
import DishForm from '../components/DishForm';

const RestaurantDashboard = () => {
  const { user, logout } = useAuth();
  const { orders, setOrders, updateOrderInState, notifications, setNotifications } = useSocket();

  const getImageURL = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const baseURL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '' : '');
    return baseURL ? `${baseURL}${url}` : url;
  };
  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'menu'
  const [menuItems, setMenuItems] = useState([]);

  // Modals state
  const [showRestaurantForm, setShowRestaurantForm] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [showDishForm, setShowDishForm] = useState(false);
  const [editingDish, setEditingDish] = useState(null);

  useEffect(() => {
    fetchMyRestaurants();
    // Notifications are managed by SocketContext, no need to fetch here
  }, []);

  // Listen for global toasts
  useEffect(() => {
    const handleToast = (event) => {
      const { message, type } = event.detail;
      setToast({ message, type });
      setTimeout(() => setToast(null), 4000);
    };
    window.addEventListener('app-toast', handleToast);
    return () => window.removeEventListener('app-toast', handleToast);
  }, []);



  useEffect(() => {
    if (selectedRestaurant) {
      if (activeTab === 'orders') {
        fetchRestaurantOrders(selectedRestaurant.id);
      } else {
        fetchMenuItems(selectedRestaurant.id);
      }
    }
  }, [selectedRestaurant, activeTab]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const fetchMyRestaurants = async () => {
    try {
      const response = await restaurantAPI.getMyRestaurants();
      const myRestaurants = response.data || [];
      setRestaurants(myRestaurants);

      if (myRestaurants.length > 0 && !selectedRestaurant) {
        setSelectedRestaurant(myRestaurants[0]);
      }
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      showToast('Failed to load restaurants', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurantOrders = async (restaurantId) => {
    try {
      const response = await orderAPI.getRestaurantOrders(restaurantId);
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      showToast('Failed to load orders', 'error');
    }
  };

  const fetchMenuItems = async (restaurantId) => {
    try {
      const response = await restaurantAPI.getMenuItems(restaurantId);
      setMenuItems(response.data || []);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      showToast('Failed to load menu items', 'error');
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      const response = await orderAPI.updateStatus(orderId, status);
      updateOrderInState(response.data.order);
      showToast(`Order #${orderId} marked as ${status}`, 'success');
    } catch (error) {
      console.error('Error updating order status:', error);
      showToast(error.response?.data?.message || 'Failed to update order status', 'error');
    }
  };

  const handleRestaurantSaved = () => {
    fetchMyRestaurants();
    setShowRestaurantForm(false);
    setEditingRestaurant(null);
    showToast('Restaurant saved successfully', 'success');
  };

  const handleDishSaved = () => {
    if (selectedRestaurant) {
      fetchMenuItems(selectedRestaurant.id);
    }
    setShowDishForm(false);
    setEditingDish(null);
    showToast('Dish saved successfully', 'success');
  };

  const getAvailableStatuses = (currentStatus) => {
    switch (currentStatus) {
      case 'confirmed':
        return ['preparing', 'cancelled'];
      case 'preparing':
        return ['ready'];
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

      <Navbar />

      {/* Modals */}
      {(showRestaurantForm || editingRestaurant) && (
        <RestaurantForm
          restaurant={editingRestaurant}
          onClose={() => {
            setShowRestaurantForm(false);
            setEditingRestaurant(null);
          }}
          onSuccess={handleRestaurantSaved}
        />
      )}

      {(showDishForm || editingDish) && selectedRestaurant && (
        <DishForm
          restaurantId={selectedRestaurant.id}
          dish={editingDish}
          onClose={() => {
            setShowDishForm(false);
            setEditingDish(null);
          }}
          onSuccess={handleDishSaved}
        />
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Restaurant Dashboard</h1>
          <button
            className="btn-zomato"
            onClick={() => setShowRestaurantForm(true)}
          >
            Add New Restaurant
          </button>
        </div>

        {/* Restaurant Selection */}
        {restaurants.length > 0 ? (
          <>
            <div className="order-card mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {selectedRestaurant?.image_url && (
                    <img
                      src={getImageURL(selectedRestaurant.image_url)}
                      alt=""
                      className="img-restaurant-thumb border shadow-sm"
                    />
                  )}
                  <h2 className="text-lg font-semibold">Select Restaurant</h2>
                </div>
                <button
                  className="text-blue-600 hover:underline text-sm"
                  onClick={() => {
                    setEditingRestaurant(selectedRestaurant);
                  }}
                >
                  Edit Restaurant Details
                </button>
              </div>
              <div className="flex gap-2 flex-wrap">
                {restaurants.map((restaurant) => (
                  <button
                    key={restaurant.id}
                    className={`btn flex items-center gap-2 ${selectedRestaurant?.id === restaurant.id
                      ? 'btn-primary'
                      : 'btn-secondary'
                      }`}
                    onClick={() => setSelectedRestaurant(restaurant)}
                  >
                    {restaurant.image_url && (
                      <img
                        src={getImageURL(restaurant.image_url)}
                        alt=""
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    )}
                    {restaurant.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Dashboard Content */}
            {selectedRestaurant && (
              <div className="order-card">
                <div className="flex border-b mb-6">
                  <button
                    className={`px-4 py-2 font-medium ${activeTab === 'orders'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                    onClick={() => setActiveTab('orders')}
                  >
                    Orders
                  </button>
                  <button
                    className={`px-4 py-2 font-medium ${activeTab === 'menu'
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                      }`}
                    onClick={() => setActiveTab('menu')}
                  >
                    Menu Management
                  </button>
                </div>

                {activeTab === 'orders' ? (
                  /* Orders Tab */
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl">Active Orders</h2>
                      <button
                        className="btn-zomato-outline"
                        onClick={() => fetchRestaurantOrders(selectedRestaurant.id)}
                      >
                        Refresh
                      </button>
                    </div>

                    {loading && orders.length === 0 ? (
                      <div className="loading">Loading orders...</div>
                    ) : orders.length === 0 ? (
                      <p className="text-secondary text-center py-8">No active orders</p>
                    ) : (
                      <div className="flex flex-col gap-4">
                        {orders
                          .filter((order) =>
                            ['confirmed', 'preparing', 'ready'].includes(order.status)
                          )
                          .map((order) => {
                            const availableStatuses = getAvailableStatuses(order.status);
                            return (
                              <div
                                key={order.id}
                                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex justify-between items-start mb-4">
                                  <div>
                                    <strong className="text-lg">Order #{order.id}</strong>
                                    <p className="text-secondary text-sm mt-1">
                                      Delivery: {order.delivery_address}
                                    </p>
                                    <p className="text-secondary text-xs mt-1">
                                      Created: {new Date(order.created_at).toLocaleString()}
                                    </p>
                                  </div>
                                  <OrderStatus status={order.status} />
                                </div>

                                <div className="bg-gray-100 p-3 rounded text-sm mb-4">
                                  <p className="font-medium mb-2">Order Items:</p>
                                  <ul className="list-disc pl-5 mb-2">
                                    {order.items?.map((item, index) => (
                                      <li key={index} className="text-secondary">
                                        {item.name} - ₹{item.price} x {item.quantity}
                                      </li>
                                    ))}
                                  </ul>
                                  <p className="font-bold text-right pt-2 border-t border-gray-300">
                                    Total: ₹{parseFloat(order.total_amount).toFixed(2)}
                                  </p>
                                </div>

                                <div className="flex gap-3 justify-end">
                                  {availableStatuses.map((status) => (
                                    <button
                                      key={status}
                                      className={`btn ${status === 'cancelled' ? 'btn-danger' : 'btn-success'
                                        }`}
                                      onClick={() => handleUpdateStatus(order.id, status)}
                                    >
                                      Mark as {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Menu Tab */
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl">Menu Items</h2>
                      <button
                        className="btn-zomato"
                        style={{ fontSize: '14px', padding: '10px 20px' }}
                        onClick={() => setShowDishForm(true)}
                      >
                        Add New Dish
                      </button>
                    </div>

                    {menuItems.length === 0 ? (
                      <p className="text-secondary text-center py-8">No menu items found. Add some dishes!</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {menuItems.map((item) => (
                          <div key={item.id} className="border rounded-lg p-4 flex gap-4">
                            {item.image_url && (
                              <img
                                src={getImageURL(item.image_url)}
                                alt={item.name}
                                className="img-dish-restaurant"
                              />
                            )}
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <h3 className="font-semibold">{item.name}</h3>
                                <span className="font-medium text-green-600">₹{item.price}</span>
                              </div>
                              <p className="text-sm text-gray-500 mb-2">{item.description}</p>
                              <div className="flex justify-between items-center mt-2">
                                <span className={`text-xs px-2 py-1 rounded ${item.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {item.is_available ? 'Available' : 'Unavailable'}
                                </span>
                                <button
                                  className="text-blue-600 hover:underline text-sm"
                                  onClick={() => setEditingDish(item)}
                                >
                                  Edit
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="order-card text-center py-12">
            <h2 className="text-xl font-semibold mb-2">Welcome via Restaurant Dashboard</h2>
            <p className="text-secondary mb-6">You don't have any restaurants yet.</p>
            <button
              className="btn-zomato"
              style={{ fontSize: '16px', padding: '14px 28px' }}
              onClick={() => setShowRestaurantForm(true)}
            >
              Create Your First Restaurant
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantDashboard;