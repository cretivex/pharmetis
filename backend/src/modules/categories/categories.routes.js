import express from 'express';
import { getCategories, getCategoryById } from './categories.controller.js';

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategoryById);

export default router;
