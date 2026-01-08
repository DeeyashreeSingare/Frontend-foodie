import React from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ toggleNotifications, notificationCount, showSearch = false, onMyOrdersClick, onSearch }) => {
    const { user, logout } = useAuth();

    return (
        <nav className="navbar shadow-sm sticky top-0 z-50">
            <div className="container flex justify-between items-center h-full gap-4">
                {/* Logo */}
                <div className="flex-shrink-0">
                    <h1
                        style={{
                            margin: 0,
                            fontSize: '2rem',
                            fontWeight: 800,
                            fontStyle: 'italic',
                            color: 'black',
                            letterSpacing: '-1px'
                        }}
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

                            <button
                                onClick={onMyOrdersClick}
                                className="nav-link mr-2"
                            >
                                My Orders
                            </button>

                            {toggleNotifications && (
                                <div
                                    className="relative cursor-pointer hover:opacity-80 transition-opacity"
                                    onClick={toggleNotifications}
                                    title="Notifications"
                                >
                                    <span className="text-2xl">🔔</span>
                                    {notificationCount > 0 && (
                                        <span
                                            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                                            style={{ minWidth: '20px', fontSize: '10px' }}
                                        >
                                            {notificationCount > 9 ? '9+' : notificationCount}
                                        </span>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={logout}
                                className="nav-link"
                            >
                                Log out
                            </button>
                        </>
                    ) : (
                        <div className="flex gap-4">
                            <a href="/login" className="text-gray-600 hover:text-primary text-lg font-light">Log in</a>
                            <a href="/signup" className="text-gray-600 hover:text-primary text-lg font-light">Sign up</a>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
