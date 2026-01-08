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

  // Listen for global toasts from SocketContext
  useEffect(() => {
    const handleToast = (event) => {
      setToast(event.detail);
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
      showToast('Order placed successfully!', 'success');
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
        onMyOrdersClick={() => {
          setSelectedRestaurant(null);
          setActiveFilter('Orders');
        }}
        onSearch={setSearchQuery}
      />

      {showNotifications && (
        <NotificationPanel onClose={() => setShowNotifications(false)} />
      )}

      {/* Hero Section - Conditional rendering if not viewing specific features */}
      {!selectedRestaurant && (
        <>
          {/* Breadcrumbs / Filter Tab */}
          <div className="sticky top-0 bg-white z-40 border-b border-gray-100">
            <div className="container py-4 flex gap-8 overflow-x-auto">
              <div className={`cursor-pointer flex items-center gap-2 pb-2 ${activeFilter === 'Delivery' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`} onClick={() => setActiveFilter('Delivery')}>
                <div className={`p-2 rounded-full ${activeFilter === 'Delivery' ? 'bg-yellow-100' : 'bg-gray-100'}`}>🛵</div>
                <span className="text-xl font-medium">Delivery</span>
              </div>
              <div className={`cursor-pointer flex items-center gap-2 pb-2 ${activeFilter === 'Dining Out' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`} onClick={() => setActiveFilter('Dining Out')}>
                <div className={`p-2 rounded-full ${activeFilter === 'Dining Out' ? 'blue-100' : 'bg-gray-100'}`}>🍽️</div>
                <span className="text-xl font-medium">Dining Out</span>
              </div>
              <div className={`cursor-pointer flex items-center gap-2 pb-2 ${activeFilter === 'Nightlife' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`} onClick={() => setActiveFilter('Nightlife')}>
                <div className={`p-2 rounded-full ${activeFilter === 'Nightlife' ? 'bg-purple-100' : 'bg-gray-100'}`}>🍷</div>
                <span className="text-xl font-medium">Nightlife</span>
              </div>
              <div className={`cursor-pointer flex items-center gap-2 pb-2 ${activeFilter === 'Orders' ? 'border-b-2 border-primary text-primary' : 'text-gray-500'}`} onClick={() => setActiveFilter('Orders')}>
                <div className={`p-2 rounded-full ${activeFilter === 'Orders' ? 'bg-blue-100' : 'bg-gray-100'}`}>📦</div>
                <span className="text-xl font-medium">Orders</span>
              </div>
            </div>
          </div>

          <div className="container mt-8">
            {activeFilter !== 'Orders' && <h2 className="text-3xl font-medium mb-8">Delivery Restaurants in Your City</h2>}

            {activeFilter !== 'Orders' && (
              loading ? (
                <div className="grid">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="card h-80 bg-gray-100 animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="grid mb-12">
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
                        className="card cursor-pointer group"
                        onClick={() => fetchMenu(rest)}
                      >
                        {/* Image Placeholder */}
                        <div className="h-48 bg-gray-200 relative overflow-hidden">
                          <img
                            src={getImageURL(rest.image_url) || `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400&auto=format&fit=crop`}
                            alt={rest.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                              if (e.target.src !== `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400&auto=format&fit=crop`) {
                                e.target.src = `https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400&auto=format&fit=crop`;
                              }
                            }}
                          />
                        </div>

                        <div className="card-body p-4">
                          <div className="flex justify-between items-start mb-2 gap-2">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <h3 className="text-lg font-bold m-0 truncate">{rest.name}</h3>
                              <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded flex-shrink-0">30-40 min</span>
                            </div>
                            <div className="bg-green-700 text-white px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5 flex-shrink-0">
                              4.2 <span className="text-[8px]">★</span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center text-xs text-gray-500 mb-2 gap-2">
                            <span className="truncate flex-1 min-w-0">Italian, Fast Food</span>
                            <span className="flex-shrink-0 whitespace-nowrap">₹200 for two</span>
                          </div>

                          <div className="border-t pt-3 mt-2 flex items-center gap-2 text-[10px] text-gray-400">
                            <span className="w-3.5 h-3.5 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 border border-blue-100 italic font-serif">i</span>
                            2500+ orders placed from here recently
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )
            )}

            {/* Orders View - ADDED THIS SECTION */}
            {activeFilter === 'Orders' && (
              <div className="mb-12">
                {orders.length === 0 ? (
                  <div className="text-center py-12 text-secondary">
                    <p className="text-xl mb-2">No past orders</p>
                    <p>Go to Delivery to order some delicious food!</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {orders.map((order) => (
                      <div key={order.id} className="border rounded-lg p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-bold">Order #{order.id}</h3>
                              <OrderStatus status={order.status} />
                            </div>
                            <p className="text-secondary text-sm mt-1">
                              {new Date(order.created_at).toLocaleString()}
                            </p>
                          </div>
                          <p className="font-bold text-xl">₹{parseFloat(order.total_amount || 0).toFixed(2)}</p>
                        </div>

                        <div className="border-t border-b py-3 my-3">
                          <p className="font-medium mb-2 text-sm text-gray-500">ITEMS</p>
                          <div className="space-y-1">
                            {order.items?.map((item, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span>{item.quantity}x {item.name}</span>
                                <span className="text-secondary">₹{item.price * item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-sm">
                          <div className="text-secondary">
                            My Delivery Address: <span className="text-gray-900">{order.delivery_address}</span>
                          </div>
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

      {/* Menu Modal / View */}
      {selectedRestaurant && (
        <div className="fixed inset-0 z-[100] bg-white overflow-y-auto">
          {/* Menu Header */}
          <div className="sticky top-0 bg-white shadow-sm z-10 p-4">
            <div className="container flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button onClick={() => setSelectedRestaurant(null)} className="text-xl p-2 hover:bg-gray-100 rounded-full">
                  ←
                </button>
                <div>
                  <h2 className="text-2xl font-bold m-0">{selectedRestaurant.name}</h2>
                  <p className="text-sm text-gray-500">Italian, Fast Food • 30-40 min</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button className="btn btn-secondary">🔍 Search in menu</button>
                {Object.keys(cart).length > 0 && (
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate('/cart')}
                  >
                    View Cart ({Object.keys(cart).length})
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="container py-8">
            {/* Menu List */}
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Recommended</h3>
                {Object.keys(cart).length > 0 && (
                  <button
                    className="btn btn-primary"
                    onClick={() => navigate('/cart')}
                  >
                    View Cart ({Object.keys(cart).length}) - ₹{cartTotal.toFixed(2)}
                  </button>
                )}
              </div>
              {loadingMenu ? (
                <div className="loading">Loading menu...</div>
              ) : (
                <div className="flex flex-col gap-6">
                  {menuItems.map((item) => (
                    <div key={item._id} className="flex justify-between items-start gap-4 pb-6 border-b border-gray-100">
                      <div className="flex-1">
                        <div className="w-4 h-4 border border-green-600 flex items-center justify-center rounded-sm mb-2">
                          <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        </div>
                        <h4 className="font-bold text-lg mb-1">{item.name}</h4>
                        <p className="font-medium text-gray-700 mb-2">₹{item.price}</p>
                        <p className="text-sm text-gray-500 line-clamp-2">{item.description || 'Delicious food item with amazing taste.'}</p>
                      </div>
                      <div className="relative img-dish-user bg-gray-100 overflow-hidden shrink-0 border shadow-sm">
                        {item.image_url && (
                          <img
                            src={getImageURL(item.image_url)}
                            alt={item.name}
                            className="img-fit"
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        )}
                        <div className="absolute bottom-0 left-0 w-full px-1 mb-1">
                          {cart[item._id] ? (
                            <div className="flex items-center justify-between bg-white text-primary rounded shadow border border-primary font-bold text-xs">
                              <button onClick={() => removeFromCart(item._id)} className="px-2 py-1 hover:bg-red-50">-</button>
                              <span>{cart[item._id].qty}</span>
                              <button onClick={() => addToCart(item)} className="px-2 py-1 hover:bg-red-50">+</button>
                            </div>
                          ) : (
                            <button
                              onClick={() => addToCart(item)}
                              className="w-full bg-white text-primary py-1.5 rounded shadow border border-gray-200 font-bold hover:bg-gray-50 text-[10px] uppercase tracking-wide"
                            >
                              ADD
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;