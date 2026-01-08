import React from 'react';

const OrderStatus = ({ status }) => {
  const statusClass = `status-badge status-${status.toLowerCase().replace('_', '')}`;
  
  const statusLabels = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    ready: 'Ready',
    picked_up: 'Picked Up',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  };

  return (
    <span className={statusClass}>
      {statusLabels[status] || status}
    </span>
  );
};

export default OrderStatus;