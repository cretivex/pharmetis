import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

// Skip rate limiting for read-only GET requests to frequently accessed endpoints
const skipRateLimit = (req) => {
  if (env.IS_DEVELOPMENT) return true;
  return false;
};

export const apiRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS || (env.IS_DEVELOPMENT ? 60000 : 900000), // 1 min in dev, 15 min in prod
  max: env.RATE_LIMIT_MAX_REQUESTS || (env.IS_DEVELOPMENT ? 1000 : 100), // 1000 in dev, 100 in prod
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: skipRateLimit,
  skipSuccessfulRequests: env.RATE_LIMIT_SKIP_SUCCESSFUL_REQUESTS
});

export const authRateLimiter = rateLimit({
  windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX,
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false
});

export const otpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 OTP requests per 15 minutes
  message: {
    success: false,
    message: 'Too many OTP requests, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: false // Count failed requests too
});
