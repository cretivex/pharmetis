import express from 'express';
import { checkDb } from './health.controller.js';

const router = express.Router();

router.get('/db', checkDb);

export default router;
