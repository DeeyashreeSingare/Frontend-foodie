import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { restaurantAPI, notificationAPI } from '../services/api';
import ToastNotification from '../components/ToastNotification';
import Navbar from '../components/Navbar';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const { notifications, setNotifications } = useSocket();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const restaurantsRes = await restaurantAPI.getAll();
      setRestaurants(restaurantsRes.data || []);
      // Notifications are managed by SocketContext, no need to fetch here
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('Failed to load system data');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const stats = [
    { label: 'Total Restaurants', value: restaurants.length, color: 'primary' },
    { label: 'Active Notifications', value: notifications.length, color: 'warning' },
    { label: 'System Status', value: 'Operational', color: 'success' },
  ];

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

      <div className="container">
        {error && <div className="error-message">{error}</div>}

        {/* Stats Overview */}
        <div className="grid mb-4">
          {stats.map((stat, index) => (
            <div key={index} className="order-card flex flex-col items-center justify-center p-6">
              <span className="text-3xl font-bold mb-2" style={{ color: `var(--${stat.color})` }}>
                {stat.value}
              </span>
              <span className="text-secondary">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Restaurants Management */}
        <div className="order-card mt-4">
          <div className="flex justify-between items-center mb-4">
            <h2>Registered Restaurants</h2>
            <button className="btn-zomato" onClick={() => showToast('Add Restaurant feature coming soon', 'info')}>
              Add Restaurant
            </button>
          </div>

          {loading ? (
            <div className="loading">Loading system data...</div>
          ) : restaurants.length === 0 ? (
            <p className="text-secondary text-center py-4">No restaurants found in the system.</p>
          ) : (
            <div className="overflow-x-auto">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                    <th style={{ padding: '12px' }}>ID</th>
                    <th style={{ padding: '12px' }}>Name</th>
                    <th style={{ padding: '12px' }}>Address</th>
                    <th style={{ padding: '12px' }}>Contact</th>
                    <th style={{ padding: '12px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {restaurants.map((restaurant) => (
                    <tr key={restaurant.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '12px' }}>#{restaurant.id}</td>
                      <td style={{ padding: '12px', fontWeight: '500' }}>{restaurant.name}</td>
                      <td style={{ padding: '12px' }}>{restaurant.address}</td>
                      <td style={{ padding: '12px' }}>{restaurant.phone}</td>
                      <td style={{ padding: '12px' }}>
                        <button
                          className="btn-zomato-outline text-sm"
                          onClick={() => showToast(`Edit ${restaurant.name} feature coming soon`, 'info')}
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* System Notifications */}
        <div className="order-card mt-4">
          <h2 className="mb-4">System Notifications</h2>
          {notifications.length === 0 ? (
            <p className="text-secondary">No active notifications</p>
          ) : (
            <ul style={{ listStyle: 'none' }}>
              {notifications.slice(0, 5).map((notif) => (
                <li key={notif.id} className="p-3 border-b border-gray-100 flex justify-between items-center">
                  <span>{notif.message}</span>
                  <span className="text-sm text-secondary">{new Date(notif.created_at).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;