import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full" style={{ maxWidth: '400px' }}>
        {/* Logo */}
        <div className="text-center mb-8">
          <h1
            style={{
              fontSize: '4rem',
              fontWeight: 900,
              fontStyle: 'italic',
              color: '#E23744',
              letterSpacing: '-3px',
              marginBottom: '0.5rem',
              textShadow: '0 2px 4px rgba(226, 55, 68, 0.1)'
            }}
          >
            foodie
          </h1>
          <p style={{ color: '#6B7280', fontSize: '0.9rem', marginTop: '0.5rem' }}>
            Discover the best food in your city
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100" style={{ boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)' }}>
          <h2 className="text-3xl font-bold text-center mb-2" style={{ color: '#1C1C1C' }}>Login</h2>
          <p className="text-center mb-6" style={{ color: '#6B7280' }}>Welcome back! Please login to your account.</p>

          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
              {successMessage}
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="input-zomato"
                style={{ width: '100%' }}
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="password">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="input-zomato"
                style={{ width: '100%' }}
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              className="btn-zomato"
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              New to Foodie?{' '}
              <Link to="/signup" style={{ color: '#E23744', fontWeight: 600 }} className="hover:underline">
                Create an account
              </Link>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;
