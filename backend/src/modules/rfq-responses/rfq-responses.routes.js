import express from 'express';
import { 
  getRFQResponses, 
  getRFQResponseById, 
  acceptRFQResponse, 
  rejectRFQResponse, 
  updateRFQResponse, 
  createRFQResponse, 
  getMyRFQResponses,
  checkQuotationStatus,
  reviewQuotation,
  sendToBuyer,
  sendBackToSupplier,
  sendNegotiationToSupplier,
  resubmitQuotation,
  submitNegotiationResponse
} from './rfq-responses.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authorize } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { updateRFQResponseSchema, negotiationResponseSchema } from './rfq-responses.validation.js';
import multer from 'multer';

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'SUPPORT_ADMIN', 'READ_ONLY_ADMIN'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (allowedMimes.includes(file.mimetype) || file.originalname.match(/\.(pdf|doc|docx|xls|xlsx)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, DOCX, XLS, XLSX files are allowed'), false);
    }
  }
});

const router = express.Router();

router.use(authenticate);

// Supplier routes - MUST come before parameterized routes
router.get('/my', authorize('VENDOR'), getMyRFQResponses);
router.get('/status/:rfqId', checkQuotationStatus);

// Admin routes - must come before /:id routes
router.patch('/:id/review', authorize(...ADMIN_ROLES), reviewQuotation);
router.post('/:id/send-to-buyer', authorize(...ADMIN_ROLES), sendToBuyer);
router.post('/:id/send-back-to-supplier', authorize(...ADMIN_ROLES), sendBackToSupplier);
router.post('/:id/send-negotiation-to-supplier', authorize(...ADMIN_ROLES), sendNegotiationToSupplier);
router.post('/:id/resubmit', authorize('VENDOR'), upload.any(), resubmitQuotation);
router.post('/:id/negotiation-response', authorize('VENDOR'), validate(negotiationResponseSchema), submitNegotiationResponse);

// Supplier create route - must come before generic /:id
router.post('/:rfqId', upload.any(), createRFQResponse);

// Buyer/Admin routes
router.get('/', getRFQResponses);
router.get('/:id', getRFQResponseById);
router.patch('/:id/accept', acceptRFQResponse);
router.patch('/:id/reject', rejectRFQResponse);
router.patch('/:id', authorize(...ADMIN_ROLES), validate(updateRFQResponseSchema), updateRFQResponse);

export default router;
