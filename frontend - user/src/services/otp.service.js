import api from '../config/api.js';

export const otpService = {
  // Login OTP
  async sendOTP(email) {
    const response = await api.post('/auth/otp/send', { email });
    return response.data?.data || response.data;
  },

  async verifyOTP(email, otp) {
    const response = await api.post('/auth/otp/verify', { email, otp });
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
    
    throw new Error(response.data?.message || 'OTP verification failed');
  },

  async resendOTP(email) {
    const response = await api.post('/auth/otp/resend', { email });
    return response.data?.data || response.data;
  },

  // Registration OTP
  async sendRegistrationOTP(email, fullName = null, companyName = null) {
    const response = await api.post('/auth/register/otp/send', { email, fullName, companyName });
    return response.data?.data || response.data;
  },

  async verifyRegistrationOTP(email, otp, fullName = null, companyName = null, password = null) {
    const body = { email, otp, fullName, companyName }
    if (password != null) body.password = password
    const response = await api.post('/auth/register/otp/verify', body);
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

  async resendRegistrationOTP(email) {
    const response = await api.post('/auth/register/otp/resend', { email });
    return response.data?.data || response.data;
  }
};
