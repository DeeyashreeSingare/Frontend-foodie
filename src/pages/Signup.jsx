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
          <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">Signup</h2>
          <p className="text-center text-gray-500 mb-6">Create your account to get started.</p>

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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none bg-white"
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
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed mt-4"
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
              <Link to="/login" className="text-red-500 font-semibold hover:text-red-600 hover:underline">
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