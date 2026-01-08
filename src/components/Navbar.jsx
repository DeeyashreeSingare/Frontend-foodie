import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ toggleNotifications, notificationCount, showSearch = false, onMyOrdersClick, onSearch, onHomeClick, cartItemCount, onCartClick }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const getHomePath = () => {
        if (!user) return '/login';
        switch (user.role) {
            case 'end_user':
                return '/user';
            case 'restaurant':
                return '/restaurant';
            case 'rider':
                return '/rider';
            case 'admin':
                return '/admin';
            default:
                return '/login';
        }
    };

    const handleHomeClick = (e) => {
        e.preventDefault();
        // Call custom home click handler if provided
        if (onHomeClick) {
            onHomeClick();
        }
        const homePath = getHomePath();
        navigate(homePath);
    };

    return (
        <nav className="navbar-zomato sticky top-0 z-50">
            <div className="container flex justify-between items-center h-full gap-4" style={{ padding: '12px 16px' }}>
                {/* Logo - Clickable Home Link */}
                <div className="flex-shrink-0">
                    <h1
                        className="logo-zomato" 
                        style={{
                            margin: 0,
                            fontSize: '2rem',
                            cursor: 'pointer',
                            userSelect: 'none'
                        }}
                        onClick={handleHomeClick}
                        onMouseEnter={(e) => {
                            e.target.style.opacity = '0.8';
                            e.target.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.opacity = '1';
                            e.target.style.transform = 'scale(1)';
                        }}
                        title={`Go to ${user?.role === 'end_user' ? 'User' : user?.role === 'restaurant' ? 'Restaurant' : user?.role === 'rider' ? 'Rider' : 'Home'} Dashboard`}
                    >
                        foodie
                        <span className="ml-2 text-2xl" role="img" aria-label="role-icon">
                            {user?.role === 'rider' && '🛵'}
                            {user?.role === 'restaurant' && '🏪'}
                            {user?.role === 'end_user' && '😋'}
                            {!user && '🍕'}
                        </span>
                    </h1>
                </div>

                {/* Search Bar (Centered, Optional) */}
                {showSearch && (
                    <div className="hidden md:flex flex-1 px-4">
                        <div className="relative w-full">
                            <input
                                type="text"
                                placeholder="Search for restaurant, cuisine or a dish"
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg shadow-sm focus:outline-none"
                                style={{ fontSize: '0.9rem' }}
                                onChange={(e) => onSearch && onSearch(e.target.value)}
                            />
                            <span className="absolute right-3 top-3 text-gray-400">🔍</span>
                        </div>
                    </div>
                )}

                {/* Right Actions */}
                <div className="flex items-center gap-6">
                    {user ? (
                        <>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="hidden sm:block font-medium">{user.name}</span>
                            </div>

                            {onCartClick && (
                                <div
                                    className="relative cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={onCartClick}
                                    title="View Cart"
                                >
                                    <span className="text-2xl">🛒</span>
                                    {cartItemCount > 0 && (
                                        <span
                                            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                                            style={{ minWidth: '20px', fontSize: '10px' }}
                                        >
                                            {cartItemCount > 9 ? '9+' : cartItemCount}
                                        </span>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={onMyOrdersClick}
                                className="nav-link mr-2"
                                style={{ 
                                    color: '#1C1C1C',
                                    fontWeight: 500,
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#F3F4F6'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                                My Orders
                            </button>

                            <button
                                onClick={logout}
                                className="nav-link"
                                style={{ 
                                    color: '#1C1C1C',
                                    fontWeight: 500,
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                    transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.target.style.backgroundColor = '#F3F4F6'}
                                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                            >
                                Log out
                            </button>
                        </>
                    ) : (
                        <div className="flex gap-4">
                            <a href="/login" style={{ color: '#1C1C1C', fontWeight: 500 }} className="hover:underline">Log in</a>
                            <a href="/signup" className="btn-zomato-outline" style={{ padding: '8px 16px', fontSize: '14px' }}>Sign up</a>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
