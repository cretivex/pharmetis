import express from 'express';
import { getSupplierRFQs } from './supplier.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticate);
router.get('/rfqs', authorize('VENDOR'), getSupplierRFQs);

export default router;
