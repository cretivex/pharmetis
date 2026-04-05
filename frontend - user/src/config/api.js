import axios from 'axios';

/**
 * Shared axios instance (withCredentials for cookies). Session probes use authApi.getSession()
 * so 401 on /auth/me does not spam the console. See src/api/authApi.js.
 * DevTools: open Network before actions; enable Preserve log to see XHR rows.
 */
/** Must be the API root URL (include `/api` if your server mounts routes there). Paths in this app are relative, e.g. `/auth/login`. */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.pharmetis.in/api';

export const NETWORK_ERROR_MESSAGE = 'Network error. Please check your connection and try again.';

function emitNetworkError(message) {
  try {
    window.dispatchEvent(new CustomEvent('api:networkError', { detail: { message } }));
  } catch (_) {}
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      if (config.headers) {
        delete config.headers['Content-Type'];
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
const refreshSubscribers = [];

function processQueue(err, token = null) {
  refreshSubscribers.forEach((prom) => {
    if (err) {
      prom.reject(err);
    } else {
      prom.resolve(token);
    }
  });
  refreshSubscribers.length = 0;
}

function clearAuthAndRedirect() {
  try {
    window.dispatchEvent(new Event('loginStateChange'));
  } catch (_) {}
  if (window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

function isPublicAuthPath(url) {
  if (!url) return false;
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/register') ||
    url.includes('/auth/otp/') ||
    url.includes('/auth/register/otp/') ||
    url.includes('/auth/request-otp') ||
    url.includes('/auth/verify-otp')
  );
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.code === 'ERR_NETWORK') {
      emitNetworkError(NETWORK_ERROR_MESSAGE);
      return Promise.reject(
        Object.assign(new Error(NETWORK_ERROR_MESSAGE), { code: 'ERR_NETWORK', isNetworkError: true })
      );
    }

    if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Session probe: no refresh attempt when checking current user
    if (originalRequest.url?.includes('/auth/me') || originalRequest.url?.includes('/auth/logout')) {
      return Promise.reject(error);
    }

    if (isPublicAuthPath(originalRequest.url) || originalRequest.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshSubscribers.push({ resolve, reject });
      })
        .then(() => api(originalRequest))
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        {},
        {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        }
      );
      processQueue(null, null);
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearAuthAndRedirect();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
