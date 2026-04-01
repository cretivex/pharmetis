import express from 'express';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { getMetrics } from './system.controller.js';

const router = express.Router();
const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'SUPPORT_ADMIN', 'READ_ONLY_ADMIN'];

router.get('/metrics', authenticate, authorize(...ADMIN_ROLES), getMetrics);

export default router;
