import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user role
    const roleRoutes = {
      end_user: '/user',
      restaurant: '/restaurant',
      rider: '/rider',
      admin: '/admin',
    };
    return <Navigate to={roleRoutes[user.role] || '/user'} replace />;
  }

  return children;
};

export default ProtectedRoute;