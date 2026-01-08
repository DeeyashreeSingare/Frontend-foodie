import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/signin');

    if (error.response?.status === 401 && !isLoginRequest) {
      // Clear token and redirect to login only if it's not a login attempt
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  signup: (data) => api.post('/api/auth/signup', data),
  signin: (data) => api.post('/api/auth/signin', data),
};

// User APIs
export const userAPI = {
  getProfile: () => api.get('/api/users/profile'),
  updateProfile: (data) => api.put('/api/users/profile', data),
};

// Restaurant APIs
export const restaurantAPI = {
  getAll: () => api.get('/api/restaurants'),
  getById: (id) => api.get(`/api/restaurants/${id}`),
  getMenuItems: (restaurantId) => api.get(`/api/restaurants/${restaurantId}/menu`),
  getMyRestaurants: () => api.get('/api/restaurants/owner/my-restaurants'),
  create: (data) => api.post('/api/restaurants', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => api.put(`/api/restaurants/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  addMenuItem: (restaurantId, data) => api.post(`/api/restaurants/${restaurantId}/menu`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateMenuItem: (restaurantId, itemId, data) => api.put(`/api/restaurants/${restaurantId}/menu/${itemId}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteMenuItem: (itemId) => api.delete(`/api/restaurants/menu/${itemId}`),
};

// Order APIs
export const orderAPI = {
  create: (data) => api.post('/api/orders', data),
  getMyOrders: () => api.get('/api/orders/my-orders'),
  getById: (id) => api.get(`/api/orders/${id}`),
  getAvailable: () => api.get('/api/orders/available'),
  acceptOrder: (id) => api.post(`/api/orders/${id}/accept`),
  updateStatus: (id, status) => api.put(`/api/orders/${id}/status`, { status }),
  updateRiderStatus: (id, status) => api.put(`/api/orders/${id}/rider-status`, { status }),
  getRiderOrders: () => api.get('/api/orders/rider/my-orders'),
  getRestaurantOrders: (restaurantId) => api.get(`/api/orders/restaurant/${restaurantId}`),
};

// Payment APIs
export const paymentAPI = {
  getByOrderId: (orderId) => api.get(`/api/payments/order/${orderId}`),
};

// Notification APIs
export const notificationAPI = {
  getAll: () => api.get('/api/notifications'),
  markAsRead: (id) => api.put(`/api/notifications/${id}/read`),
  markAllAsRead: () => api.put('/api/notifications/read-all'),
  delete: (id) => api.delete(`/api/notifications/${id}`),
};

// Export api as both default and named export for convenience
export { api };
export default api;