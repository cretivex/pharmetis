import express from 'express';
import { createRFQ, getRFQs, getRFQById, updateRFQ, deleteRFQ, getAssignedRFQs, processPayment, completeRFQ, sendRFQToSuppliers, getRFQHistory } from './rfqs.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { createRFQSchema, updateRFQSchema, processPaymentSchema, sendRFQToSuppliersSchema } from './rfqs.validation.js';

const router = express.Router();

router.use(authenticate);

router.post('/', validate(createRFQSchema), createRFQ);
router.get('/assigned', authorize('VENDOR'), getAssignedRFQs);
router.get('/', getRFQs);
router.post('/:id/send', authorize('ADMIN'), validate(sendRFQToSuppliersSchema), sendRFQToSuppliers);
router.post('/:id/pay', authorize('BUYER'), validate(processPaymentSchema), processPayment);
router.post('/:id/complete', authorize('BUYER'), completeRFQ);
router.get('/:id/history', getRFQHistory);
router.get('/:id', getRFQById);
router.patch('/:id', validate(updateRFQSchema), updateRFQ);
router.delete('/:id', deleteRFQ);

export default router;
