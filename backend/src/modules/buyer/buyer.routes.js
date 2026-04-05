import express from 'express';
import {
  createBuyerRFQ,
  getBuyerRFQs,
  getBuyerRFQById,
  acceptBuyerQuotation,
  rejectBuyerQuotation,
  requestLowerPrice,
  updateBuyerCompany,
  getBuyerOrders,
  getBuyerInvoices,
} from './buyer.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { createBuyerRFQSchema, requestLowerPriceSchema } from './buyer.validation.js';

const router = express.Router();

router.use(authenticate);
// Allow both BUYER and ADMIN to access buyer endpoints
router.use(authorize('BUYER', 'ADMIN'));

router.put('/company', updateBuyerCompany);
router.get('/orders', getBuyerOrders);
router.get('/invoices', getBuyerInvoices);
router.post('/rfqs', validate(createBuyerRFQSchema), createBuyerRFQ);
router.get('/rfqs', getBuyerRFQs);
router.get('/rfqs/:id', getBuyerRFQById);
router.post('/quotations/:id/accept', acceptBuyerQuotation);
router.post('/quotations/:id/reject', rejectBuyerQuotation);
router.post('/quotations/:id/request-lower-price', validate(requestLowerPriceSchema), requestLowerPrice);

export default router;
