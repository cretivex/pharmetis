import { authRateLimiter } from './rateLimit.middleware.js';

// Rate limiter specifically for OTP requests: max 3 requests per 10 minutes
export const otpRateLimiter = authRateLimiter;
