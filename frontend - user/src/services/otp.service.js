import api from '../config/api.js';

function extractUser(response) {
  const data = response.data?.data || response.data;
  return data?.user ?? null;
}

export const otpService = {
  async sendOTP(email) {
    const response = await api.post('/auth/otp/send', { email });
    return response.data?.data || response.data;
  },

  async verifyOTP(email, otp) {
    const response = await api.post('/auth/otp/verify', { email, otp });
    const user = extractUser(response);
    if (!user) {
      throw new Error(response.data?.message || 'OTP verification failed');
    }
    return user;
  },

  async resendOTP(email) {
    const response = await api.post('/auth/otp/resend', { email });
    return response.data?.data || response.data;
  },

  async sendRegistrationOTP(email, fullName = null, companyName = null) {
    const response = await api.post('/auth/register/otp/send', { email, fullName, companyName });
    return response.data?.data || response.data;
  },

  async verifyRegistrationOTP(email, otp, fullName = null, companyName = null, password = null) {
    const body = { email, otp, fullName, companyName };
    if (password != null) body.password = password;
    const response = await api.post('/auth/register/otp/verify', body);
    const user = extractUser(response);
    if (!user) {
      throw new Error(response.data?.message || 'Registration failed');
    }
    return user;
  },

  async resendRegistrationOTP(email) {
    const response = await api.post('/auth/register/otp/resend', { email });
    return response.data?.data || response.data;
  },
};
