import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI, userAPI } from '../services/api';
import { initSocket, disconnectSocket } from '../services/socket';
import { getUserRole } from '../utils/jwt';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem('token');
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
    return null;
  });

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        
        if (storedToken && storedUser) {
          try {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
            // Initialize socket connection
            initSocket(storedToken);
            // Fetch fresh profile data
            const response = await userAPI.getProfile();
            setUser(response.data);
            if (typeof window !== 'undefined') {
              localStorage.setItem('user', JSON.stringify(response.data));
            }
          } catch (error) {
            console.error('Auth initialization error:', error);
            // Clear invalid token
            if (typeof window !== 'undefined') {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
            }
            setToken(null);
            setUser(null);
            disconnectSocket();
          }
        }
      } catch (error) {
        console.error('Auth setup error:', error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    setToken(null);
    setUser(null);
    disconnectSocket();
  };

  const signup = async (userData) => {
    try {
      const response = await authAPI.signup(userData);
      // Signup returns token, but we redirect to login
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Signup failed',
      };
    }
  };

  const signin = async (email, password) => {
    try {
      const response = await authAPI.signin({ email, password });
      const { accessToken, ...userData } = response.data;
      
      // Store token and user
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', accessToken);
        localStorage.setItem('user', JSON.stringify(userData));
      }
      setToken(accessToken);
      setUser(userData);
      
      // Initialize socket connection
      initSocket(accessToken);
      
      return { success: true, user: userData };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  };

  const isAuthenticated = () => {
    return !!token && !!user;
  };

  const hasRole = (role) => {
    if (!user) return false;
    return user.role === role || getUserRole() === role;
  };

  const value = {
    user,
    token,
    loading,
    signup,
    signin,
    logout,
    isAuthenticated,
    hasRole,
    setUser, // For updating user profile
  };

  try {
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
  } catch (error) {
    console.error('Error in AuthProvider:', error);
    return <div style={{ padding: '20px', color: 'red' }}>Error loading authentication: {error.message}</div>;
  }
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};