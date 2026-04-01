import axios from 'axios';
import { logError } from '@/lib/observability';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.pharmetis.in/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers = [];
let redirecting = false;

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function clearTokensAndRedirect() {
  if (redirecting) return;
  redirecting = true;
  window.location.href = '/login';
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function refreshToken() {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return null;
  }
  const maxAttempts = 3;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        {},
        { withCredentials: true, headers: { 'Content-Type': 'application/json' } }
      );
      return response.status === 200 ? 'cookie_session' : null;
    } catch (err) {
      if (err.response?.status === 429) {
        const retryAfter = parseInt(err.response?.headers?.['retry-after'], 10) || Math.pow(2, attempt + 1);
        await delay(retryAfter * 1000);
        continue;
      }
      if (attempt < maxAttempts - 1) {
        await delay(Math.pow(2, attempt) * 1000);
      } else {
        break;
      }
    }
  }
  return null;
}

api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 429) {
      return Promise.reject(error);
    }

    if (error.response?.status === 403) {
      logError(error, { context: 'api_403' });
      clearTokensAndRedirect();
      return Promise.reject(error);
    }

    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      clearTokensAndRedirect();
      return Promise.reject(error);
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh(() => resolve(api(originalRequest)));
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const newToken = await refreshToken();
      if (!newToken) {
        logError(error, { context: 'token_refresh' });
        clearTokensAndRedirect();
        return Promise.reject(error);
      }
      onRefreshed(newToken);
      return api(originalRequest);
    } catch (refreshError) {
      onRefreshed(null);
      logError(refreshError, { context: 'token_refresh' });
      clearTokensAndRedirect();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
