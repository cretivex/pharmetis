import express from 'express';
import multer from 'multer';
import { 
  getProducts,
  getProductsFilter,
  getProductBySlug, 
  getProductById, 
  getFeaturedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkCreateProducts,
  getMyProducts
} from './products.controller.js';
import { authenticate, authorize } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { createProductSchema, updateProductSchema } from './products.validation.js';

const router = express.Router();

// Multer configuration for bulk upload - ONLY .xlsx files
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
  fileFilter: (req, file, cb) => {
    // Check both mimetype and file extension
    const isValidMimeType = file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const isValidExtension = file.originalname.toLowerCase().endsWith('.xlsx');
    
    if (isValidMimeType || isValidExtension) {
      cb(null, true);
    } else {
      cb(new Error('Only .xlsx files are allowed'), false);
    }
  }
});

// Public routes
router.get('/', getProducts);
router.get('/filter', getProductsFilter);
router.get('/featured', getFeaturedProducts);
router.get('/slug/:slug', getProductBySlug);

// Protected routes (admin/vendor only) - MUST come before /:id to avoid route conflicts
router.get('/my', authenticate, authorize('VENDOR'), getMyProducts);
router.post('/', authenticate, authorize('ADMIN', 'VENDOR'), validate(createProductSchema), createProduct);
router.post('/bulk-upload', authenticate, authorize('ADMIN', 'VENDOR'), (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      // Handle multer errors
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload error'
        });
      }
      // Handle file filter errors
      return res.status(400).json({
        success: false,
        message: err.message || 'Invalid file type. Only .xlsx files are allowed.'
      });
    }
    // File uploaded successfully, proceed to controller
    next();
  });
}, bulkCreateProducts);

// Public routes that use :id parameter (must come after specific routes)
router.get('/:id', getProductById);

// Protected routes with :id parameter
router.patch('/:id', authenticate, authorize('ADMIN', 'VENDOR'), validate(updateProductSchema), updateProduct);
router.delete('/:id', authenticate, authorize('ADMIN', 'VENDOR'), deleteProduct);

export default router;
