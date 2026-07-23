import axios from 'axios';

const normalizeUrl = (value) => value?.trim().replace(/\/+$/, '');

const API = axios.create({
  baseURL: normalizeUrl(import.meta.env.VITE_API_URL) || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses (expired/invalid token)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only clear if not on login/register page
      const isAuthPage = window.location.pathname.includes('/login') ||
        window.location.pathname.includes('/register');
      if (!isAuthPage) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('admin');
      }
    }
    return Promise.reject(error);
  }
);

// Admin API — uses admin token
const AdminAPI = axios.create({
  baseURL: normalizeUrl(import.meta.env.VITE_API_URL) || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

AdminAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Non-blocking Render backend warmup ping to eliminate cold-start wait times
let warmupPromise = null;

const warmupBackend = () => {
  if (warmupPromise) return warmupPromise;

  warmupPromise = (async () => {
    try {
      // 60-second timeout allows Render free tier instance to finish cold boot
      const res = await API.get('/health', { timeout: 60000 });
      return res.data;
    } catch {
      try {
        const fallbackRes = await API.get('/', { timeout: 60000 });
        return fallbackRes.data;
      } catch (err) {
        console.warn('Backend warmup ping error:', err.message);
        warmupPromise = null; // reset so next retry can attempt
      }
    }
  })();

  return warmupPromise;
};

export { API, AdminAPI, warmupBackend };
export default API;
