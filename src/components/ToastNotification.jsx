import React, { useState, useEffect } from 'react';

const ToastNotification = ({ message, type = 'info', duration = 3000, onClose }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        if (duration) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                onClose && onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [duration, onClose]);

    if (!isVisible) return null;

    const getBackgroundColor = () => {
        switch (type) {
            case 'success': return 'var(--success)';
            case 'error': return 'var(--danger)';
            case 'warning': return 'var(--warning)';
            default: return 'var(--primary)';
        }
    };

    const styles = {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: getBackgroundColor(),
        color: 'white',
        padding: '12px 24px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        zIndex: 1000,
        animation: 'slideIn 0.3s ease-out forwards',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    };

    return (
        <div style={styles}>
            {message}
        </div>
    );
};

export default ToastNotification;
