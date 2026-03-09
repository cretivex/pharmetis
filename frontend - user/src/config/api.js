import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.pharmetis.in/api';

/** Standardized error for network failures (no silent fail). */
export const NETWORK_ERROR_MESSAGE = 'Network error. Please check your connection and try again.';

/** Emit network error so UI can show toast/banner. No-op if no listener. */
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
});

let isRefreshing = false;
/** Queue of { resolve, reject } for requests waiting on token refresh (refresh subscribers). */
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
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('isLoggedIn');
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new Event('loginStateChange'));
  window.location.href = '/login';
}

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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

    // No config (e.g. request never sent) or not 401 or already retried → just reject
    if (!originalRequest || error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Never refresh or redirect for requests that had no token (login/register wrong password).
    // Only try refresh when the request was made with Authorization header (session expired).
    const hadAuthHeader = originalRequest.headers?.Authorization;
    if (!hadAuthHeader) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes('/auth/refresh')) {
      clearAuthAndRedirect();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshSubscribers.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      clearAuthAndRedirect();
      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        { refreshToken },
        { headers: { 'Content-Type': 'application/json' }, timeout: 10000 }
      );
      const payload = data?.data || data;
      const token = payload?.accessToken || payload?.token;
      if (token) {
        localStorage.setItem('accessToken', token);
        if (payload.refreshToken) {
          localStorage.setItem('refreshToken', payload.refreshToken);
        }
        processQueue(null, token);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      }
    } catch (refreshError) {
      processQueue(refreshError, null);
      clearAuthAndRedirect();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }

    return Promise.reject(error);
  }
);

export default api;
