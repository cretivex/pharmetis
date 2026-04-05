import express from 'express';
import { listMyPayments, createPayment, confirmPayment } from './payments.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { createPaymentSchema, confirmPaymentSchema } from './payments.validation.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('BUYER'));

router.get('/', listMyPayments);
router.post('/create', validate(createPaymentSchema), createPayment);
router.post('/confirm/:id', validate(confirmPaymentSchema), confirmPayment);

export default router;
