import express from 'express';
import { 
  getSuppliers, 
  getSupplierBySlug, 
  getSupplierById, 
  getSupplierProducts,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierMe,
  updateSupplierMe,
  verifySupplierOTP,
  resendSupplierOTP,
  sendResetOtpSupplier,
  resetPasswordSupplier
} from './suppliers.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
  createSupplierSchema,
  updateSupplierSchema,
  updateSupplierMeSchema,
  sendResetOtpSchema,
  resetPasswordSchema
} from './suppliers.validation.js';
import { verifyOTPSchema, resendOTPSchema } from './suppliers-otp.validation.js';

const router = express.Router();

// Public routes
router.post('/register', validate(createSupplierSchema), createSupplier);
router.post('/verify-otp', validate(verifyOTPSchema), verifySupplierOTP);
router.post('/resend-otp', validate(resendOTPSchema), resendSupplierOTP);
router.post('/auth/send-reset-otp', validate(sendResetOtpSchema), sendResetOtpSupplier);
router.post('/auth/reset-password', validate(resetPasswordSchema), resetPasswordSupplier);
router.get('/', getSuppliers);
router.get('/slug/:slug', getSupplierBySlug);

// Protected routes - must come before /:id to avoid route conflicts
router.get('/me', authenticate, authorize('VENDOR'), getSupplierMe);
router.patch('/me', authenticate, authorize('VENDOR'), validate(updateSupplierMeSchema), updateSupplierMe);
router.get('/:id/products', getSupplierProducts);
router.get('/:id', getSupplierById);
router.patch('/:id', authenticate, authorize('ADMIN'), validate(updateSupplierSchema), updateSupplier);
router.delete('/:id', authenticate, authorize('ADMIN'), deleteSupplier);

export default router;
