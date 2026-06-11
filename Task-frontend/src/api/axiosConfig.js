import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// 1. Request Interceptor
api.interceptors.request.use((config) => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser?.token) {
        config.headers.Authorization = `Bearer ${parsedUser.token}`;
      }
    } catch (e) {
      console.error("Token parsing error", e);
    }
  }
  return config;
});

// 2. Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // 401: Unauthorized - Force Logout
      if (error.response.status === 401) {
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      
      // 403: Forbidden - Log for debugging
      if (error.response.status === 403) {
        console.error("Access Forbidden:", error.response.data);
      }
    }
    return Promise.reject(error);
  }
);

export default api;