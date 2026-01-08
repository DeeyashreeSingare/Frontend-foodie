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
              fontSize: '3.5rem',
              fontWeight: 900,
              fontStyle: 'italic',
              color: '#EF4444',
              letterSpacing: '-2px',
              marginBottom: '0'
            }}
          >
            foodie
          </h1>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">Login</h2>
          <p className="text-center text-gray-500 mb-6">Welcome back! Please login to your account.</p>

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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mt-4"
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
              <Link to="/signup" className="text-red-500 font-semibold hover:text-red-600 hover:underline">
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
