import { Router } from 'express';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { listAuditLogs, getMeta } from './audit-logs.controller.js';

const router = Router();

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'SUPPORT_ADMIN', 'READ_ONLY_ADMIN'];

router.get('/', authenticate, authorize(...ADMIN_ROLES), listAuditLogs);
router.get('/meta', authenticate, authorize(...ADMIN_ROLES), getMeta);

export default router;
