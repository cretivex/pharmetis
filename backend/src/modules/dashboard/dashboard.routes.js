import express from 'express';
import { getDashboardStats, getDashboardCounts, getDashboardMonitoring } from './dashboard.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'SUPPORT_ADMIN', 'READ_ONLY_ADMIN'];

const router = express.Router();

router.get('/stats', authenticate, authorize(...ADMIN_ROLES), getDashboardStats);
router.get('/counts', authenticate, authorize(...ADMIN_ROLES), getDashboardCounts);
router.get('/monitoring', authenticate, authorize(...ADMIN_ROLES), getDashboardMonitoring);

export default router;
