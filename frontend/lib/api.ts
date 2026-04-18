import axios from 'axios';
import { auth } from './firebase';

// Point to your local backend (update for production)
const BASE_URL = __DEV__
  ? 'http://localhost:3000/api'
  : 'https://tienda-de-ropa-kristel.onrender.com/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// ── Request interceptor: attach Firebase ID token ──────────────────────────
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: centralized error handling ──────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ?? error.message ?? 'Network error';
    return Promise.reject(new Error(message));
  }
);

export default api;
