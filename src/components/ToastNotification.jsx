import React, { useState, useEffect } from 'react';

const ToastNotification = ({ message, type = 'info', duration = 4000, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (duration) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(() => onClose && onClose(), 300);
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    if (!isVisible) return null;

    const getStyles = () => {
        const baseStyles = {
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            color: 'white',
            padding: '16px 24px',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            minWidth: '300px',
            maxWidth: '400px',
            animation: 'slideInRight 0.3s ease-out forwards',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
        };

        switch (type) {
            case 'success':
                return { ...baseStyles, backgroundColor: '#60B246' };
            case 'error':
                return { ...baseStyles, backgroundColor: '#E23744' };
            case 'warning':
                return { ...baseStyles, backgroundColor: '#FFA500' };
            default:
                return { ...baseStyles, backgroundColor: '#E23744' };
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success': return '✓';
            case 'error': return '✕';
            case 'warning': return '⚠';
            default: return '🔔';
        }
    };

    return (
        <div 
            style={getStyles()}
            onClick={() => {
                setIsVisible(false);
                setTimeout(() => onClose && onClose(), 300);
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
            <span style={{ fontSize: '20px', fontWeight: 'bold' }}>{getIcon()}</span>
            <span style={{ flex: 1, fontSize: '14px', fontWeight: 500 }}>{message}</span>
        </div>
    );
};

export default ToastNotification;
