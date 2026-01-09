import React, { useState, useEffect } from 'react';

const ToastNotification = ({ message, type = 'info', duration = 5000, onClose }) => {
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
            padding: '18px 28px',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            minWidth: '320px',
            maxWidth: '450px',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            transform: 'translateX(0)',
            opacity: 1,
            animation: 'slideInRight 0.4s ease-out forwards',
        };

        switch (type) {
            case 'success':
                return { ...baseStyles, backgroundColor: '#60B246', borderLeft: '4px solid #4CAF50' };
            case 'error':
                return { ...baseStyles, backgroundColor: '#E23744', borderLeft: '4px solid #C92A37' };
            case 'warning':
                return { ...baseStyles, backgroundColor: '#FFA500', borderLeft: '4px solid #FF8C00' };
            default:
                return { ...baseStyles, backgroundColor: '#E23744', borderLeft: '4px solid #C92A37' };
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'success': return '✓';
            case 'error': return '✕';
            case 'warning': return '⚠';
            default: return 'ℹ';
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
            <span style={{ fontSize: '24px', fontWeight: 'bold', flexShrink: 0 }}>{getIcon()}</span>
            <span style={{ flex: 1, fontSize: '16px', fontWeight: 600, lineHeight: '1.4' }}>{message}</span>
        </div>
    );
};

export default ToastNotification;
