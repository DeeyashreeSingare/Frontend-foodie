import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'end_user',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signup(formData);
    setLoading(false);

    if (result.success) {
      navigate('/login', { state: { message: 'Signup successful! Please login.' } });
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
          <p className="brand-subtitle">Join the community</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Create Account</h2>

        <form onSubmit={handleSubmit}>
          <div className="login-form-group">
            <label className="login-label" htmlFor="name">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="login-input"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>

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
              minLength={6}
              placeholder="Create a strong password"
            />
          </div>

          <div className="login-form-group">
            <label className="login-label" htmlFor="role">
              I want to join as
            </label>
            <select
              id="role"
              name="role"
              className="login-input"
              value={formData.role}
              onChange={handleChange}
              required
              style={{ appearance: 'auto' }}
            >
              <option value="end_user">End User (I want to order food)</option>
              <option value="restaurant">Restaurant (I want to sell food)</option>
              <option value="rider">Rider (I want to deliver)</option>
            </select>
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                <span>Creating account...</span>
              </>
            ) : (
              'Sign Up'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="create-account-link">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;