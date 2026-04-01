import express from 'express';
import {
  getAllBuyers,
  getBuyerById,
  getBuyerRFQs,
  getBuyerPayments,
  suspendBuyer,
  activateBuyer
} from './buyers.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('ADMIN'));

// Get all buyers
router.get('/', getAllBuyers);

// Get buyer by ID
router.get('/:id', getBuyerById);

// Get buyer RFQs
router.get('/:id/rfqs', getBuyerRFQs);

// Get buyer payments
router.get('/:id/payments', getBuyerPayments);

// Suspend buyer
router.patch('/:id/suspend', suspendBuyer);

// Activate buyer
router.patch('/:id/activate', activateBuyer);

export default router;
