import express from 'express';
import { registerController, loginController, refreshTokenController, getMeController } from './auth.controller.js';
import { sendOTPController, verifyOTPController, resendOTPController, sendRegistrationOTPController, verifyRegistrationOTPController, resendRegistrationOTPController } from './otp.controller.js';
import { requestOTPController as requestSecureOTPController, verifyOTPController as verifySecureOTPController } from './secure-otp.controller.js';
import { testEmailConnection, sendTestEmail } from './test-email.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { authenticate, authenticateRefresh } from '../../middlewares/auth.middleware.js';
import { authRateLimiter, otpRateLimiter } from '../../middlewares/rateLimit.middleware.js';
import { registerSchema, loginSchema, refreshTokenSchema, sendOTPSchema, verifyOTPSchema, sendRegistrationOTPSchema, verifyRegistrationOTPSchema, requestOTPSchema, verifySecureOTPSchema } from './auth.validation.js';

const router = express.Router();

// Traditional login/register (kept for backward compatibility)
router.post('/register', authRateLimiter, validate(registerSchema), registerController);
router.post('/login', authRateLimiter, validate(loginSchema), loginController);
router.post('/refresh', validate(refreshTokenSchema), authenticateRefresh, refreshTokenController);
router.get('/me', authenticate, getMeController);

// OTP-based login (using more lenient rate limiter)
router.post('/otp/send', otpRateLimiter, validate(sendOTPSchema), sendOTPController);
router.post('/otp/verify', authRateLimiter, validate(verifyOTPSchema), verifyOTPController);
router.post('/otp/resend', otpRateLimiter, validate(sendOTPSchema), resendOTPController);

// OTP-based registration (for buyers) - using more lenient rate limiter
router.post('/register/otp/send', otpRateLimiter, validate(sendRegistrationOTPSchema), sendRegistrationOTPController);
router.post('/register/otp/verify', authRateLimiter, validate(verifyRegistrationOTPSchema), verifyRegistrationOTPController);
router.post('/register/otp/resend', otpRateLimiter, validate(sendRegistrationOTPSchema), resendRegistrationOTPController);

// Secure OTP Login (new implementation) - using more lenient rate limiter
router.post('/request-otp', otpRateLimiter, validate(requestOTPSchema), requestSecureOTPController);
router.post('/verify-otp', authRateLimiter, validate(verifySecureOTPSchema), verifySecureOTPController);

// Test endpoints (development only)
if (process.env.NODE_ENV === 'development') {
  router.get('/test-email-connection', testEmailConnection);
  router.post('/test-email-send', sendTestEmail);
}

export default router;
