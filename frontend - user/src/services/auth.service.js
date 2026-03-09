import api from '../config/api.js';

export const authService = {
  async login(email, password) {
    const payload = {
      email: typeof email === 'string' ? email.trim().toLowerCase() : '',
      password: typeof password === 'string' ? password : ''
    };
    const response = await api.post('/auth/login', payload);
    const data = response.data?.data || response.data;
    
    if (data && (data.accessToken || data.token)) {
      const token = data.accessToken || data.token;
      localStorage.setItem('accessToken', token);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      localStorage.setItem('isLoggedIn', 'true');
      
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('loginStateChange'));
      
      return data;
    }
    
    throw new Error(response.data?.message || 'Login failed');
  },

  async register(email, password, role = 'BUYER') {
    const response = await api.post('/auth/register', { email, password, role });
    const data = response.data?.data || response.data;
    
    if (data && (data.accessToken || data.token)) {
      const token = data.accessToken || data.token;
      localStorage.setItem('accessToken', token);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      localStorage.setItem('isLoggedIn', 'true');
      
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('loginStateChange'));
      
      return data;
    }
    
    throw new Error(response.data?.message || 'Registration failed');
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data?.data?.user || response.data?.user;
  },

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post('/auth/refresh', { refreshToken });
    const data = response.data?.data || response.data;
    
    if (data && (data.accessToken || data.token)) {
      const token = data.accessToken || data.token;
      localStorage.setItem('accessToken', token);
      if (data.refreshToken) {
        localStorage.setItem('refreshToken', data.refreshToken);
      }
      return data;
    }
    
    throw new Error(response.data?.message || 'Token refresh failed');
  },

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('isLoggedIn');
    
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('loginStateChange'));
  },

  isAuthenticated() {
    return !!localStorage.getItem('accessToken');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    if (user && user.role != null && typeof user.role === 'string') {
      user.role = user.role.toUpperCase();
    }
    return user;
  }
};
