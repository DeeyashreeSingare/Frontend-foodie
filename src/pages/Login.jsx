import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css'; // Import the new CSS file

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signin, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const redirectBasedOnRole = (role) => {
    switch (role) {
      case 'end_user':
        navigate('/user');
        break;
      case 'restaurant':
        navigate('/restaurant');
        break;
      case 'rider':
        navigate('/rider');
        break;
      case 'admin':
        navigate('/admin');
        break;
      default:
        navigate('/user');
    }
  };

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && isAuthenticated()) {
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          redirectBasedOnRole(user.role);
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }
    }
  }, [isAuthenticated, navigate]);

  // Show success message from signup
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signin(formData.email, formData.password);
    setLoading(false);

    if (result.success) {
      redirectBasedOnRole(result.user.role);
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <h1 className="brand-title">foodie</h1>
          <p className="brand-subtitle">Discover the best food in your city</p>
        </div>

        {/* Messages */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 text-center">
            {successMessage}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Login</h2>

        <form onSubmit={handleSubmit}>
          <div className="login-form-group">
            <label className="login-label" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="login-input"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="e.g. user@example.com"
            />
          </div>

          <div className="login-form-group">
            <label className="login-label" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="login-input"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Logging in...</span>
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>
            New to Foodie?{' '}
            <Link to="/signup" className="create-account-link">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
