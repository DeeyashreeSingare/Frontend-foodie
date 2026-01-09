import { io } from 'socket.io-client';

let socket = null;

// Initialize socket connection with JWT token
export const initSocket = (token) => {
  if (socket && socket.connected) {
    return socket;
  }

  // Use VITE_API_BASE_URL from environment
  // In development, use empty string to leverage Vite proxy
  // In production, VITE_API_BASE_URL must be set
  let socketURL;
  if (import.meta.env.DEV) {
    // Development: use Vite proxy if VITE_API_BASE_URL not set
    socketURL = import.meta.env.VITE_API_BASE_URL || '';
  } else {
    // Production: require VITE_API_BASE_URL
    socketURL = import.meta.env.VITE_API_BASE_URL;
    if (!socketURL) {
      console.error('VITE_API_BASE_URL is not set in production!');
    }
  }
  
  socket = io(socketURL, {
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