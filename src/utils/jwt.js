// Decode JWT token to get payload
export const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

// Get user role from token
export const getUserRole = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  const decoded = decodeToken(token);
  return decoded?.role || null;
};

// Get user ID from token
export const getUserId = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  const decoded = decodeToken(token);
  return decoded?.id || null;
};