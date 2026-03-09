import express from 'express';
import { saveProduct, unsaveProduct, getSavedProducts } from './saved-products.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticate);

router.post('/', saveProduct);
router.delete('/:productId', unsaveProduct);
router.get('/', getSavedProducts);

export default router;
