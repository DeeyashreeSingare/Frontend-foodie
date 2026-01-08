import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { restaurantAPI, orderAPI } from '../services/api';
import { getSocket } from '../services/socket';
import Navbar from '../components/Navbar';
import NotificationPanel from '../components/NotificationPanel';
import OrderStatus from '../components/OrderStatus';
import ToastNotification from '../components/ToastNotification';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { notifications, orders, setOrders, addOrderToState, setNotifications } = useSocket();

  const getImageURL = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `http://localhost:3000${url}`;
  };
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [toast, setToast] = useState(null);

  // Cart & Order State
  const [cart, setCart] = useState(() => {
    // Load cart from localStorage if available
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : {};
  }); // { itemId: { item, qty } }
  const [selectedRestaurant, setSelectedRestaurant] = useState(() => {
    // Load selected restaurant from localStorage if available
    const savedRestaurant = localStorage.getItem('selectedRestaurant');
    return savedRestaurant ? JSON.parse(savedRestaurant) : null;
  });
  const [menuItems, setMenuItems] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(false);

  // Foodie-style Filters
  const [activeFilter, setActiveFilter] = useState('Delivery');
  const [searchQuery, setSearchQuery] = useState('');


  useEffect(() => {
    fetchRestaurants();
    fetchMyOrders();
    fetchNotifications();
  }, []);

  // Listen for global toasts from SocketContext (real-time notifications)
  useEffect(() => {
    const handleToast = (event) => {
      const { message, type } = event.detail;
      setToast({ message, type });
      // Auto-close after 4 seconds
      setTimeout(() => setToast(null), 4000);
    };
    window.addEventListener('app-toast', handleToast);
    return () => window.removeEventListener('app-toast', handleToast);
  }, []);

  const fetchNotifications = async () => {
    try {
      const { notificationAPI } = await import('../services/api');
      const response = await notificationAPI.getAll();
      const fetchedNotifications = response.data || [];
      console.log('Fetched notifications:', fetchedNotifications);
      setNotifications(fetchedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const fetchRestaurants = async () => {
    try {
      const response = await restaurantAPI.getAll();
      setRestaurants(response.data || []);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      showToast('Failed to load restaurants', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyOrders = async () => {
    try {
      const response = await orderAPI.getMyOrders();
      setOrders(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchMenu = async (restaurant) => {
    setLoadingMenu(true);
    setSelectedRestaurant(restaurant);
    localStorage.setItem('selectedRestaurant', JSON.stringify(restaurant));
    try {
      const response = await restaurantAPI.getMenuItems(restaurant.id);
      setMenuItems(response.data || []);
    } catch (error) {
      console.error('Error fetching menu:', error);
      showToast('Failed to load menu', 'error');
    } finally {
      setLoadingMenu(false);
    }
  };

  const addToCart = (item) => {
    setCart((prev) => {
      const currentQty = prev[item._id]?.qty || 0;
      const newCart = {
        ...prev,
        [item._id]: { item, qty: currentQty + 1 },
      };
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
    showToast(`Added ${item.name} to cart`, 'success');
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => {
      const current = prev[itemId];
      if (!current) return prev;
      let newCart;
      if (current.qty <= 1) {
        const { [itemId]: _, ...rest } = prev;
        newCart = rest;
      } else {
        newCart = {
          ...prev,
          [itemId]: { ...current, qty: current.qty - 1 },
        };
      }
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const cartTotal = Object.values(cart).reduce(
    (sum, { item, qty }) => sum + item.price * qty,
    0
  );

  const cartItemCount = Object.values(cart).reduce(
    (sum, { qty }) => sum + qty,
    0
  );

  const handlePlaceOrder = async () => {
    if (!selectedRestaurant) return;

    // Transform cart to expected items array
    const items = Object.values(cart).map(({ item, qty }) => ({
      menu_item_id: item._id,
      quantity: qty,
    }));

    if (items.length === 0) {
      showToast('Your cart is empty', 'warning');
      return;
    }

    try {
      const orderData = {
        restaurant_id: selectedRestaurant.id,
        items,
        total_amount: cartTotal,
        delivery_address: user.address || 'Default Address',
      };

      const response = await orderAPI.create(orderData);
      addOrderToState(response.data.order);
      setCart({});
      localStorage.removeItem('cart');
      localStorage.removeItem('selectedRestaurant');
      setSelectedRestaurant(null);
      showToast('Thank you! Your order is placed and will be delivered soon.', 'success');
    } catch (error) {
      console.error('Error placing order:', error);
      showToast('Failed to place order', 'error');
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="bg-white min-h-screen">
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
        showSearch={true}
        cartItemCount={cartItemCount}
        onCartClick={() => navigate('/cart')}
        onMyOrdersClick={() => {
          setSelectedRestaurant(null);
          setActiveFilter('Orders');
        }}
        onHomeClick={() => {
          setSelectedRestaurant(null);
          localStorage.removeItem('selectedRestaurant');
        }}
        onSearch={setSearchQuery}
      />

      {showNotifications && (
        <NotificationPanel onClose={() => setShowNotifications(false)} />
      )}

      {/* Hero Section - Conditional rendering if not viewing specific features */}
      {!selectedRestaurant && (
        <>
          {/* Breadcrumbs / Filter Tab - Zomato Style */}
          <div className="sticky top-0 bg-white z-40 border-b" style={{ borderColor: '#E8E8E8', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)' }}>
            <div className="container py-3 flex gap-6 overflow-x-auto" style={{ paddingLeft: '24px', paddingRight: '24px' }}>
              <div 
                className={`cursor-pointer flex items-center gap-2 pb-3 transition-colors ${activeFilter === 'Delivery' ? 'border-b-2' : ''}`}
                style={{ 
                  borderBottomColor: activeFilter === 'Delivery' ? '#E23744' : 'transparent',
                  color: activeFilter === 'Delivery' ? '#E23744' : '#6B7280'
                }}
                onClick={() => setActiveFilter('Delivery')}
              >
                <span className="text-lg">🛵</span>
                <span className="text-base font-semibold whitespace-nowrap">Delivery</span>
              </div>
              <div 
                className={`cursor-pointer flex items-center gap-2 pb-3 transition-colors ${activeFilter === 'Dining Out' ? 'border-b-2' : ''}`}
                style={{ 
                  borderBottomColor: activeFilter === 'Dining Out' ? '#E23744' : 'transparent',
                  color: activeFilter === 'Dining Out' ? '#E23744' : '#6B7280'
                }}
                onClick={() => setActiveFilter('Dining Out')}
              >
                <span className="text-lg">🍽️</span>
                <span className="text-base font-semibold whitespace-nowrap">Dining Out</span>
              </div>
              <div 
                className={`cursor-pointer flex items-center gap-2 pb-3 transition-colors ${activeFilter === 'Nightlife' ? 'border-b-2' : ''}`}
                style={{ 
                  borderBottomColor: activeFilter === 'Nightlife' ? '#E23744' : 'transparent',
                  color: activeFilter === 'Nightlife' ? '#E23744' : '#6B7280'
                }}
                onClick={() => setActiveFilter('Nightlife')}
              >
                <span className="text-lg">🍷</span>
                <span className="text-base font-semibold whitespace-nowrap">Nightlife</span>
              </div>
              <div 
                className={`cursor-pointer flex items-center gap-2 pb-3 transition-colors ${activeFilter === 'Orders' ? 'border-b-2' : ''}`}
                style={{ 
                  borderBottomColor: activeFilter === 'Orders' ? '#E23744' : 'transparent',
                  color: activeFilter === 'Orders' ? '#E23744' : '#6B7280'
                }}
                onClick={() => setActiveFilter('Orders')}
              >
                <span className="text-lg">📦</span>
                <span className="text-base font-semibold whitespace-nowrap">Orders</span>
              </div>
            </div>
          </div>

          <div className="container mt-6" style={{ paddingLeft: '24px', paddingRight: '24px' }}>
            {activeFilter !== 'Orders' && (
              <h2 className="text-2xl font-semibold mb-6" style={{ color: '#1C1C1C' }}>
                Delivery Restaurants in Your City
              </h2>
            )}

            {activeFilter !== 'Orders' && (
              loading ? (
                <div className="grid">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="card h-80 bg-gray-100 animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="grid mb-12" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                  {restaurants
                    .filter(rest => {
                      if (!searchQuery) return true;
                      const query = searchQuery.toLowerCase();
                      const name = rest.name ? rest.name.toLowerCase() : '';
                      const cuisine = rest.cuisine ? rest.cuisine.toLowerCase() : '';
                      return name.includes(query) || cuisine.includes(query);
                    })
                    .map((rest) => (
                      <div
                        key={rest.id}
                        className="restaurant-card"
                        onClick={() => fetchMenu(rest)}
                        style={{ cursor: 'pointer' }}
                      >
                        {/* Restaurant Image */}
                        <div style={{ height: '180px', overflow: 'hidden', position: 'relative', borderRadius: '12px 12px 0 0' }}>
                          <img
                            src={getImageURL(rest.image_url) || `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400&auto=format&fit=crop`}
                            alt={rest.name}
                            className="restaurant-card-image"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              if (e.target.src !== `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400&auto=format&fit=crop`) {
                                e.target.src = `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400&auto=format&fit=crop`;
                              }
                            }}
                          />
                        </div>

                        <div className="restaurant-card-content" style={{ padding: '16px' }}>
                          <div className="restaurant-card-title" style={{ marginBottom: '8px' }}>
                            <span style={{ flex: 1, minWidth: 0, fontSize: '18px', fontWeight: 600, color: '#1C1C1C' }} className="truncate">{rest.name}</span>
                            <div className="restaurant-card-rating" style={{ fontSize: '13px', padding: '4px 8px' }}>
                              4.2 <span style={{ fontSize: '10px' }}>★</span>
                            </div>
                          </div>

                          <div className="restaurant-card-cuisine" style={{ fontSize: '13px', color: '#6B7280', marginBottom: '12px', lineHeight: '1.4' }}>
                            {rest.description || 'Italian, Fast Food'} • ₹200 for two
                          </div>

                          <div className="restaurant-card-info" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px' }}>
                            <span className="restaurant-card-delivery-time" style={{ padding: '4px 8px', fontSize: '11px' }}>30-40 min</span>
                            <span style={{ fontSize: '11px', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ 
                                width: '8px', 
                                height: '8px', 
                                borderRadius: '50%', 
                                background: '#60B246', 
                                display: 'inline-block'
                              }}></span>
                              2500+ orders
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )
            )}

            {/* Orders View - Clean Design */}
            {activeFilter === 'Orders' && (
              <div className="mb-12">
                {orders.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4">📦</div>
                    <p className="text-xl font-semibold mb-2" style={{ color: '#1C1C1C' }}>No past orders</p>
                    <p style={{ color: '#6B7280' }}>Go to Delivery to order some delicious food!</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-5">
                    {orders.map((order) => (
                      <div 
                        key={order.id} 
                        className="bg-white rounded-xl p-6 border"
                        style={{ 
                          borderColor: '#E8E8E8',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                        }}
                      >
                        <div className="flex justify-between items-start mb-5">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold" style={{ color: '#1C1C1C' }}>Order #{order.id}</h3>
                              <OrderStatus status={order.status} />
                            </div>
                            <p className="text-sm" style={{ color: '#6B7280' }}>
                              {new Date(order.created_at).toLocaleString()}
                            </p>
                          </div>
                          <p className="font-bold text-2xl" style={{ color: '#1C1C1C' }}>₹{parseFloat(order.total_amount || 0).toFixed(2)}</p>
                        </div>

                        <div className="border-t border-b py-4 my-4" style={{ borderColor: '#F3F4F6' }}>
                          <p className="font-semibold mb-3 text-sm uppercase tracking-wide" style={{ color: '#6B7280' }}>Items</p>
                          <div className="space-y-2">
                            {order.items?.map((item, index) => (
                              <div key={index} className="flex justify-between text-base">
                                <span style={{ color: '#1C1C1C' }}>{item.quantity}x {item.name}</span>
                                <span className="font-semibold" style={{ color: '#1C1C1C' }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="text-sm">
                          <p style={{ color: '#6B7280' }}>
                            <span className="font-medium">Delivery Address:</span>{' '}
                            <span style={{ color: '#1C1C1C' }}>{order.delivery_address}</span>
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Menu Page - Grid Layout Like Home Page */}
      {selectedRestaurant && (
        <div className="fixed inset-0 z-[100] bg-white overflow-y-auto">
          {/* Menu Items Grid - Like Restaurant Cards */}
          <div className="container mx-auto px-4 sm:px-6 py-6">
            {loadingMenu ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin text-5xl mb-4">⏳</div>
                <p className="text-gray-600 text-sm">Loading menu...</p>
              </div>
            ) : menuItems.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-600 text-base">No menu items available</p>
              </div>
              ) : (
              <>
                <div className="grid mb-6">
                  {menuItems.map((item) => (
                    <div
                      key={item._id}
                      className="restaurant-card"
                    >
                      {/* Food Image */}
                      <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
                        <img
                          src={getImageURL(item.image_url) || `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400&auto=format&fit=crop`}
                          alt={item.name}
                          className="restaurant-card-image"
                          onError={(e) => {
                            if (e.target.src !== `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400&auto=format&fit=crop`) {
                              e.target.src = `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400&auto=format&fit=crop`;
                            }
                          }}
                        />
                      </div>

                      <div className="restaurant-card-content">
                        {/* Veg/Non-Veg Indicator */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-4 h-4 border-2 border-green-600 flex items-center justify-center rounded-sm">
                          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                          </div>
                          <span className="text-xs font-semibold text-green-600 uppercase">VEG</span>
                        </div>

                        <div className="restaurant-card-title">
                          <span style={{ flex: 1, minWidth: 0 }} className="truncate">{item.name}</span>
                          <div className="restaurant-card-rating">
                            ₹{item.price}
                          </div>
                        </div>

                        <div className="restaurant-card-cuisine">
                          {item.description || 'Delicious food item with amazing taste and quality ingredients.'}
                      </div>

                        <div className="restaurant-card-info">
                          {/* Add to Cart Button */}
                          {cart[item._id] ? (
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => removeFromCart(item._id)} 
                                className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-red-600 text-red-600 font-bold hover:bg-red-50 transition-colors"
                              >
                                −
                              </button>
                              <span className="text-sm font-semibold text-gray-900 min-w-[24px] text-center">
                                {cart[item._id].qty}
                              </span>
                              <button 
                                onClick={() => addToCart(item)} 
                                className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-red-600 text-red-600 font-bold hover:bg-red-50 transition-colors"
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(item)}
                              className="btn-zomato"
                              style={{ fontSize: '12px', padding: '8px 16px' }}
                            >
                              ADD
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* View Cart Button - Below Items */}
                {Object.keys(cart).length > 0 && (
                  <div className="mt-6 mb-6">
                    <button
                      className="w-full rounded-lg py-3 px-5 font-semibold text-lg transition-colors flex items-center justify-center gap-2"
                      style={{ 
                        backgroundColor: '#E23744',
                        color: 'white'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#C92A37'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#E23744'}
                      onClick={() => navigate('/cart')}
                    >
                      <span className="text-xl">🛒</span>
                      <span>View Cart ({Object.keys(cart).length} items)</span>
                      <span className="font-bold">₹{cartTotal.toFixed(2)}</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;