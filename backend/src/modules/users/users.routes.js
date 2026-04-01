import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  setPassword,
  getUserSettings,
  updateUserSettings
} from './users.controller.js';
import {
  getCompanyInfo,
  updateCompanyInfo
} from './company.controller.js';
import {
  getAddresses,
  getAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} from './addresses.controller.js';
import {
  getSecuritySettings,
  updateOTPLoginPreference,
  logoutAllDevices,
  revokeSession
} from './security.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { authRateLimiter } from '../../middlewares/rateLimit.middleware.js';
import {
  updateProfileSchema,
  changePasswordSchema,
  setPasswordSchema,
  updateSettingsSchema,
  companyInfoSchema,
  addressSchema,
  updateAddressSchema,
  otpPreferenceSchema
} from './users.validation.js';

const router = express.Router();

router.use(authenticate);

// Profile routes
router.get('/profile', getUserProfile);
router.patch('/profile', validate(updateProfileSchema), updateUserProfile);

// Password routes - with rate limiting
router.post('/password/change', authRateLimiter, validate(changePasswordSchema), changePassword);
router.post('/password/set', authRateLimiter, validate(setPasswordSchema), setPassword);

// Settings routes
router.get('/settings', getUserSettings);
router.patch('/settings', validate(updateSettingsSchema), updateUserSettings);

// Company info routes
router.get('/company', getCompanyInfo);
router.patch('/company', validate(companyInfoSchema), updateCompanyInfo);

// Address routes
router.get('/addresses', getAddresses);
router.get('/addresses/:id', getAddress);
router.post('/addresses', validate(addressSchema), createAddress);
router.patch('/addresses/:id', validate(updateAddressSchema), updateAddress);
router.delete('/addresses/:id', deleteAddress);
router.patch('/addresses/:id/default', setDefaultAddress);

// Security routes
router.get('/security', getSecuritySettings);
router.patch('/security/otp-preference', validate(otpPreferenceSchema), updateOTPLoginPreference);
router.post('/security/logout-all', logoutAllDevices);
router.delete('/security/sessions/:id', revokeSession);

export default router;
