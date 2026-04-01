import api from '../config/api.js';
import { getSession } from '../api/authApi.js';
import { store } from '../store/index.js';
import { logoutUser } from '../store/authSlice.js';

function normalizeUser(user) {
  if (user && user.role != null && typeof user.role === 'string') {
    return { ...user, role: user.role.toUpperCase() };
  }
  return user;
}

export const authService = {
  getCurrentUser() {
    const user = store.getState().auth.user;
    return normalizeUser(user);
  },

  isAuthenticated() {
    return !!store.getState().auth.user;
  },

  async getMe() {
    const user = await getSession();
    return user ?? null;
  },

  async refreshToken() {
    const response = await api.post('/auth/refresh', {});
    return response.data?.data || response.data;
  },

  async logout() {
    await store.dispatch(logoutUser());
  },
};
