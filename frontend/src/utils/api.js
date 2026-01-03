import axios from "axios";

/* ✅ ADD THIS HERE */
if (!import.meta.env.VITE_API_URL) {
  console.error("VITE_API_URL is not defined");
}

/* THEN THIS */
const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear old tokens
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('currentUserName');
      localStorage.removeItem('currentUserPhone');
      localStorage.removeItem('currentUserVehicle');
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('login')) {
        window.location.href = '/user-login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData) => api.post('/users/register', userData),
  login: (phone, password) => api.post('/users/login', { phone, password }),
  adminLogin: (adminId, password) => api.post('/users/admin-login', { adminId, password }),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (userData) => api.put('/users/profile', userData),
};

// Shipment API
export const shipmentAPI = {
  getAll: (params) => api.get('/shipments', { params }),
  getById: (id) => api.get(`/shipments/${id}`),
  getAvailable: () => api.get('/shipments/available'),
  create: (shipmentData) => {
    // If FormData, send with multipart/form-data header
    if (shipmentData instanceof FormData) {
      return api.post('/shipments', shipmentData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    return api.post('/shipments', shipmentData);
  },
  update: (id, shipmentData) => {
    // If FormData, send with multipart/form-data header
    if (shipmentData instanceof FormData) {
      return api.put(`/shipments/${id}`, shipmentData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    return api.put(`/shipments/${id}`, shipmentData);
  },
  delete: (id) => api.delete(`/shipments/${id}`),
  getDetails: (id) => api.get(`/shipments/${id}/details`),
  getTracking: (id) => api.get(`/shipments/${id}/tracking`),
};

// Booking API
export const bookingAPI = {
  getAll: (params) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (shipmentId) => api.post('/bookings', { shipmentId }),
  updateStatus: (id, status) => api.put(`/bookings/${id}`, { status }),
  delete: (id) => api.delete(`/bookings/${id}`),
};

// User Notification API
export const userNotificationAPI = {
  getAll: (params) => api.get('/users/notifications', { params }),
  getById: (id) => api.get(`/users/notifications/${id}`),
  create: (data) => api.post('/users/notifications', data),
  markAsRead: (id) => api.put(`/users/notifications/${id}/read`),
  markAllAsRead: () => api.put('/users/notifications/read-all'),
  delete: (id) => api.delete(`/users/notifications/${id}`),
  deleteAll: () => api.delete('/users/notifications/all'),
  getUnreadCount: () => api.get('/users/notifications/unread/count'),
};

// Admin Notification API
export const adminNotificationAPI = {
  getAll: (params) => api.get('/admin/notifications', { params }),
  getById: (id) => api.get(`/admin/notifications/${id}`),
  markAsRead: (id) => api.put(`/admin/notifications/${id}/read`),
  markAllAsRead: () => api.put('/admin/notifications/read-all'),
  delete: (id) => api.delete(`/admin/notifications/${id}`),
  deleteAll: () => api.delete('/admin/notifications/all'),
  getUnreadCount: () => api.get('/admin/notifications/unread/count'),
};

// Image URL helper - ensures consistent image URL formatting across the app
export const getImageUrl = (imagePath, placeholder = '/Truck Images.jpeg') => {
  if (!imagePath) return placeholder;
  
  // If already a full URL (http/https), return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If starts with /uploads, it's a relative path - prepend backend URL
  if (imagePath.startsWith('/uploads')) {
    const backendUrl = import.meta.env.VITE_API_URL;
    return `${backendUrl}${imagePath}`;
  }
  
  // If it's a data URL (base64), return as is
  if (imagePath.startsWith('data:')) {
    return imagePath;
  }
  
  // Otherwise, assume it's a relative path and prepend backend URL
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  return `${backendUrl}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
};
console.log("API URL:", import.meta.env.VITE_API_URL);


export default api;

