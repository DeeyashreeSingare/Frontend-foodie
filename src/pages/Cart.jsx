import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import Navbar from '../components/Navbar';
import ToastNotification from '../components/ToastNotification';
import { orderAPI } from '../services/api';

const Cart = () => {
  const { user } = useAuth();
  const { addOrderToState } = useSocket();
  const navigate = useNavigate();
  const [cart, setCart] = useState({});
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [toast, setToast] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);

  useEffect(() => {
    // Load cart and restaurant from localStorage
    const savedCart = localStorage.getItem('cart');
    const savedRestaurant = localStorage.getItem('selectedRestaurant');
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
    if (savedRestaurant) {
      setSelectedRestaurant(JSON.parse(savedRestaurant));
    }
    
    // Check for pending order success toast
    const pendingToast = sessionStorage.getItem('orderSuccessToast');
    if (pendingToast) {
      setToast(JSON.parse(pendingToast));
      sessionStorage.removeItem('orderSuccessToast');
    }
  }, []);

  const getImageURL = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const baseURL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? '' : '');
    return baseURL ? `${baseURL}${url}` : url;
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

  const deleteFromCart = (itemId) => {
    setCart((prev) => {
      const { [itemId]: _, ...rest } = prev;
      localStorage.setItem('cart', JSON.stringify(rest));
      return rest;
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
    if (!selectedRestaurant) {
      setToast({ message: 'Please select a restaurant first', type: 'error' });
      return;
    }

    // Transform cart to expected items array
    const items = Object.values(cart).map(({ item, qty }) => ({
      menu_item_id: item._id,
      quantity: qty,
    }));

    if (items.length === 0) {
      setToast({ message: 'Your cart is empty', type: 'warning' });
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
      
      // Mark that order was placed
      setOrderPlaced(true);
      
      // Show success toast notification FIRST before clearing state
      const toastMessage = '🎉 Thank you! Your order is placed and will be delivered soon.';
      setToast({ 
        message: toastMessage, 
        type: 'success' 
      });
      
      // Save toast to sessionStorage so it persists after state change
      sessionStorage.setItem('orderSuccessToast', JSON.stringify({
        message: toastMessage,
        type: 'success'
      }));
      
      // Also trigger global toast event for consistency
      window.dispatchEvent(new CustomEvent('app-toast', {
        detail: { 
          message: toastMessage,
          type: 'success'
        }
      }));
      
      // Clear cart and restaurant AFTER showing toast
      setCart({});
      localStorage.removeItem('cart');
      localStorage.removeItem('selectedRestaurant');
      
      // Delay clearing selectedRestaurant to allow toast to show
      setTimeout(() => {
        setSelectedRestaurant(null);
      }, 200);
    } catch (error) {
      console.error('Error placing order:', error);
      setToast({ message: 'Failed to place order', type: 'error' });
    }
  };

  // Only show "Thank you" page if order was actually placed
  if (!selectedRestaurant && orderPlaced) {
    return (
      <div className="bg-white min-h-screen">
        {toast && (
          <ToastNotification
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
        <Navbar />
        <div className="container py-12 text-center">
  
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#1C1C1C' }}>Thank you! Your order is placed and will be delivered soon.</h2>
          <p className="text-gray-600 mb-6">We're preparing your delicious meal!</p>
          <button
            onClick={() => {
              setOrderPlaced(false);
              navigate('/user');
            }}
            className="btn-zomato"
            style={{ padding: '12px 24px', fontSize: '16px' }}
          >
            Browse More Restaurants
          </button>
        </div>
      </div>
    );
  }

  // If no restaurant selected and no order placed, redirect to user dashboard
  if (!selectedRestaurant && !orderPlaced) {
    return (
      <div className="bg-white min-h-screen">
        <Navbar />
        <div className="container py-12 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold mb-2">No restaurant selected</h2>
          <p className="text-gray-600 mb-6">Please select a restaurant to view your cart.</p>
          <button
            onClick={() => navigate('/user')}
            className="btn-zomato"
            style={{ padding: '12px 24px', fontSize: '16px' }}
          >
            Browse Restaurants
          </button>
        </div>
      </div>
    );
  }

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
        cartItemCount={cartItemCount}
        onCartClick={() => navigate('/cart')}
      />

      <div className="container py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/user')}
            className="text-gray-600 hover:text-gray-900 mb-4 flex items-center gap-2"
          >
            <span className="text-xl">←</span>
            <span>Back to Menu</span>
          </button>
          <h1 className="text-3xl font-bold">Your Cart</h1>
          <p className="text-gray-600 mt-2">{selectedRestaurant.name}</p>
        </div>

        {Object.keys(cart).length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add delicious items to get started!</p>
            <button
              onClick={() => navigate('/user')}
              className="btn-zomato"
            >
              Browse Restaurants
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="order-card">
                <h2 className="text-xl font-bold mb-6">Cart Items</h2>
                <div className="space-y-4">
                  {Object.values(cart).map(({ item, qty }) => (
                    <div
                      key={item._id}
                      className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      {item.image_url && (
                        <img
                          src={getImageURL(item.image_url)}
                          alt={item.name}
                          className="w-24 h-24 object-cover rounded-lg"
                          onError={(e) => (e.target.style.display = 'none')}
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-lg">{item.name}</h3>
                          <button
                            onClick={() => deleteFromCart(item._id)}
                            className="text-red-500 hover:text-red-700 text-xl"
                            title="Remove item"
                          >
                            ×
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {item.description || 'Delicious food item'}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 border border-gray-300 rounded-lg">
                            <button
                              onClick={() => removeFromCart(item._id)}
                              className="px-3 py-1 text-lg font-bold hover:bg-gray-100 transition-colors"
                            >
                              −
                            </button>
                            <span className="px-4 py-1 font-semibold">{qty}</span>
                            <button
                              onClick={() => addToCart(item)}
                              className="px-3 py-1 text-lg font-bold hover:bg-gray-100 transition-colors"
                            >
                              +
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold">₹{(item.price * qty).toFixed(2)}</p>
                            <p className="text-xs text-gray-500">₹{item.price} each</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="order-card sticky top-24">
                <h2 className="text-xl font-bold mb-6">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span>₹0.00</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>₹0.00</span>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-100 mb-6">
                    <div className="flex justify-between items-center text-xl font-bold">
                      <span>Total Amount</span>
                      <span className="text-orange-600">₹{cartTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrder}
                  className="w-full rounded-lg py-3 px-5 font-semibold text-lg transition-colors flex items-center justify-center gap-2"
                  style={{ 
                    backgroundColor: '#E23744',
                    color: 'white',
                    marginTop: '1rem'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#C92A37'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#E23744'}
                >
                  Place Order
                </button>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Delivery Address:</strong>
                  </p>
                  <p className="text-sm text-gray-800">{user.address || 'Default Address'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
