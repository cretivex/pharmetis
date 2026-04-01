import express from 'express';
import { getCategories, getCategoryById, createCategory, updateCategory } from './categories.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { createCategorySchema, updateCategorySchema } from './categories.validation.js';

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategoryById);
router.post('/', authenticate, authorize('ADMIN', 'SUPER_ADMIN', 'SUPPORT_ADMIN'), validate(createCategorySchema), createCategory);
router.patch('/:id', authenticate, authorize('ADMIN', 'SUPER_ADMIN', 'SUPPORT_ADMIN'), validate(updateCategorySchema), updateCategory);

export default router;
