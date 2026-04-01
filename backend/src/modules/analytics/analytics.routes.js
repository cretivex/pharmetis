import express from 'express';
import { getAnalytics } from './analytics.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', authenticate, authorize('ADMIN'), getAnalytics);

export default router;
