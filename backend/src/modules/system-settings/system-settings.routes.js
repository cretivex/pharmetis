import express from 'express';
import { getSystemSettings, updateSystemSettings } from './system-settings.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', authenticate, authorize('ADMIN'), getSystemSettings);
router.patch('/', authenticate, authorize('ADMIN'), updateSystemSettings);

export default router;
