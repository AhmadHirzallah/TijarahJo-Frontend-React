
import axios from 'axios';

/**
 * CONNECTED TO YOUR LOCAL BACKEND:
 * Using the port from your launchSettings.json (7064)
 */
export const BACKEND_URL = 'https://localhost:7064';
const BASE_URL = `${BACKEND_URL}/api`; 

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isExpired = error.response.headers['token-expired'] === 'true';
      if (isExpired || !localStorage.getItem('jwt_token')) {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_data');
        window.location.href = '#/login?expired=true';
      }
    }
    // Logic for handling Network Errors (Backend Offline)
    if (!error.response) {
      console.error("The API server is not responding. Please ensure your .NET project is running at https://localhost:7064");
    }
    return Promise.reject(error);
  }
);

export default api;
