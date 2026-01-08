import React from 'react';

const OrderStatus = ({ status }) => {
  const statusKey = status.toLowerCase().replace('_', '');
  const statusClass = `status-badge status-${statusKey}`;
  
  const statusLabels = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    ready: 'Ready',
    picked_up: 'Picked Up',
    on_the_way: 'On The Way',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };

  return (
    <span className={statusClass} style={{ 
      display: 'inline-flex',
      alignItems: 'center',
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 600
    }}>
      {statusLabels[status] || status}
    </span>
  );
};

export default OrderStatus;