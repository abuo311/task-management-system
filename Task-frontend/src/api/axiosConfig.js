import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// 1. Request Interceptor: Attach the JWT
api.interceptors.request.use(
  (config) => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && parsedUser.token) {
          config.headers.Authorization = `Bearer ${parsedUser.token}`;
        }
      } catch (e) {
        console.error("Token parsing error in interceptor", e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 2. Response Interceptor: Handle Global Errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle Unauthorized (Token Expired/Missing)
      if (error.response.status === 401) {
        console.warn("Session expired. Logging out...");
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      
      // Inside api.js response interceptor
if (error.response.status === 403) {
    console.error("FORBIDDEN ERROR:", {
        url: error.config.url,
        method: error.config.method,
        data: error.response.data
    });
    
    const displayMessage = error.response.data?.message || "Access Denied: Insufficient Permissions.";
    alert(displayMessage);
}
    }
    return Promise.reject(error);
  }
);

export default api;