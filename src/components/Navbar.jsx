import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = ({ showSearch = false, onMyOrdersClick, onSearch, onHomeClick, cartItemCount, onCartClick }) => {
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
        if (onHomeClick) {
            onHomeClick();
        }
        const homePath = getHomePath();
        navigate(homePath);
    };

    return (
        <nav className="navbar-zomato sticky top-0 z-50">
            <div className="navbar-container">
                {/* Logo Section */}
                <div onClick={handleHomeClick} style={{ cursor: 'pointer' }}>
                    <h1 className="logo-zomato" title="Go to Dashboard">
                        foodie
                        <span role="img" aria-label="role-icon" style={{ fontSize: '1.8rem' }}>
                            {user?.role === 'rider' && '🛵'}
                            {user?.role === 'restaurant' && '🏪'}
                            {user?.role === 'end_user' && '😋'}
                            {!user && '🍕'}
                        </span>
                    </h1>
                </div>

                {/* Search Bar (Centered) */}
                {showSearch && (
                    <div className="search-bar-container">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search for restaurant, cuisine or a dish"
                            className="search-input"
                            onChange={(e) => onSearch && onSearch(e.target.value)}
                        />
                    </div>
                )}

                {/* Right Actions */}
                <div className="nav-actions">
                    {user ? (
                        <>
                            {onCartClick && (
                                <div
                                    className="cart-icon-wrapper"
                                    onClick={onCartClick}
                                    title="View Cart"
                                >
                                    <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>🛒</span>
                                    {cartItemCount > 0 && (
                                        <span className="cart-badge">
                                            {cartItemCount > 9 ? '9+' : cartItemCount}
                                        </span>
                                    )}
                                </div>
                            )}

                            <div className="user-profile">
                                <div className="user-avatar">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="user-name">{user.name}</span>
                            </div>

                            <button onClick={onMyOrdersClick} className="nav-btn nav-btn-ghost">
                                Orders
                            </button>

                            <button
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to log out?')) {
                                        logout();
                                    }
                                }}
                                className="nav-btn nav-btn-ghost"
                                style={{ color: '#E23744' }}
                            >
                                Log out
                            </button>
                        </>
                    ) : (
                        <div className="flex gap-3">
                            <a href="/login" className="nav-btn nav-btn-ghost">Log in</a>
                            <a href="/signup" className="nav-btn nav-btn-outline">Sign up</a>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
