import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
          <h2 className="text-3xl font-bold text-center mb-2" style={{ color: '#1C1C1C' }}>Signup</h2>
          <p className="text-center mb-6" style={{ color: '#6B7280' }}>Create your account to get started.</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="name">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="input-zomato"
                style={{ width: '100%' }}
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
              />
            </div>

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
                minLength={6}
                placeholder="Create a strong password"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="role">
                Select Role
              </label>
              <select
                id="role"
                name="role"
                className="input-zomato"
                style={{ width: '100%' }}
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="end_user">End User</option>
                <option value="restaurant">Restaurant Partner</option>
                <option value="rider">Delivery Partner</option>
              </select>
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
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#E23744', fontWeight: 600 }} className="hover:underline">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;