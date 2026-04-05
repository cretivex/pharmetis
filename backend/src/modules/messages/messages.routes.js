import express from 'express';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import {
  listThreads,
  createThread,
  listMessages,
  sendMessage,
} from './messages.controller.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize('BUYER', 'VENDOR', 'ADMIN'));

router.get('/threads', listThreads);
router.post('/threads', createThread);
router.get('/threads/:threadId/messages', listMessages);
router.post('/threads/:threadId/messages', sendMessage);

export default router;
