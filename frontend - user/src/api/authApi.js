/**
 * Auth HTTP layer: paths, payloads, and response parsing only.
 * Redux thunks in authSlice call these functions; keep UI/state out of here.
 *
 * DevTools: open the Network tab before loading or submitting so XHR rows appear;
 * use Preserve log. A 401 on GET /auth/me when logged out is expected (session probe).
 */
import api from '../config/api.js';
import { encryptLoginPayload } from '../utils/authCrypto.js';

function normalizeUser(user) {
  if (user && user.role != null && typeof user.role === 'string') {
    return { ...user, role: user.role.toUpperCase() };
  }
  return user;
}

/**
 * Current user from cookies, or null if unauthenticated (401).
 * Uses validateStatus so 401 does not throw — avoids noisy console errors for the session probe.
 */
export async function getSession() {
  try {
    const res = await api.get('/auth/me', {
      validateStatus: (status) => status === 200 || status === 401,
    });
    if (res.status === 401) {
      // Access token may be expired; try rotating via refresh cookie once.
      const refreshRes = await api.post('/auth/refresh', {}, {
        validateStatus: (status) => status === 200 || status === 401 || status === 400,
      });
      if (refreshRes.status !== 200) return null;

      const retryRes = await api.get('/auth/me', {
        validateStatus: (status) => status === 200 || status === 401,
      });
      if (retryRes.status === 401) return null;
      const retryUser = retryRes.data?.data?.user ?? retryRes.data?.user ?? null;
      return retryUser ? normalizeUser(retryUser) : null;
    }
    const user = res.data?.data?.user ?? res.data?.user ?? null;
    return user ? normalizeUser(user) : null;
  } catch {
    return null;
  }
}

export async function loginWithPassword({ email, password }) {
  const payload = {
    email: typeof email === 'string' ? email.trim().toLowerCase() : '',
    password: typeof password === 'string' ? password : '',
  };
  try {
    const encryptedPayload = encryptLoginPayload(payload);
    const { data } = await api.post('/auth/login', { data: encryptedPayload });
    const body = data?.data ?? data;
    const user = body?.user;
    if (!user) {
      throw new Error(data?.message || 'Login failed');
    }
    return normalizeUser(user);
  } catch (err) {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      'Login failed';
    throw new Error(msg);
  }
}

export async function logoutSession() {
  await api.post('/auth/logout');
}

export async function forgotPassword(email) {
  const { data } = await api.post('/auth/forgot-password', { email: String(email || '').trim().toLowerCase() });
  return data;
}

export async function resetPassword(token, newPassword, confirmPassword) {
  const { data } = await api.post('/auth/reset-password', {
    token,
    newPassword,
    confirmPassword
  });
  return data;
}
