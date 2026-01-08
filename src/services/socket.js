import { io } from 'socket.io-client';

let socket = null;

// Initialize socket connection with JWT token
export const initSocket = (token) => {
  if (socket && socket.connected) {
    return socket;
  }

  socket = io('http://localhost:3000', {
    auth: {
      token: token,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  // Also set token in headers for compatibility
  socket.io.opts.extraHeaders = {
    Authorization: `Bearer ${token}`
  };

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  return socket;
};

// Get current socket instance
export const getSocket = () => {
  return socket;
};

// Disconnect socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export default socket;