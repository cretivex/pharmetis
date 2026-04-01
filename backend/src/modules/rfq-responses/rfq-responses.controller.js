import { 
  getRFQResponsesService, 
  getRFQResponseByIdService, 
  acceptRFQResponseService, 
  rejectRFQResponseService, 
  updateRFQResponseService, 
  createRFQResponseService, 
  getMyRFQResponsesService,
  checkSupplierQuotationStatus,
  reviewSupplierQuotationService,
  sendQuotationToBuyerService,
  sendBackToSupplierService,
  sendNegotiationToSupplierService,
  resubmitQuotationService,
  submitNegotiationResponseService
} from './rfq-responses.service.js';
import { logger } from '../../utils/logger.js';
import { ApiError } from '../../utils/ApiError.js';
import prisma from '../../config/database.js';

export const getRFQResponses = async (req, res, next) => {
  try {
    const { rfqId } = req.query;
    const result = await getRFQResponsesService(rfqId, req.user);
    
    res.status(200).json({
      success: true,
      message: 'RFQ responses retrieved successfully',
      data: result
    });
  } catch (error) {
    logger.error('RFQ responses controller error:', error);
    next(error);
  }
};

export const getRFQResponseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await getRFQResponseByIdService(id, req.user);
    
    res.status(200).json({
      success: true,
      message: 'RFQ response retrieved successfully',
      data: result
    });
  } catch (error) {
    logger.error('RFQ response controller error:', error);
    next(error);
  }
};

export const acceptRFQResponse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await acceptRFQResponseService(id, req.user);
    
    res.status(200).json({
      success: true,
      message: 'RFQ response accepted successfully',
      data: result
    });
  } catch (error) {
    logger.error('Accept RFQ response error:', error);
    next(error);
  }
};

export const rejectRFQResponse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await rejectRFQResponseService(id, req.user);
    
    res.status(200).json({
      success: true,
      message: 'RFQ response rejected successfully',
      data: result
    });
  } catch (error) {
    logger.error('Reject RFQ response error:', error);
    next(error);
  }
};

export const updateRFQResponse = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    logger.info(`Update RFQ response request - ID: ${id}, Body:`, JSON.stringify(req.body, null, 2));
    
    const result = await updateRFQResponseService(id, req.user, req.body);
    
    logger.info(`Update RFQ response success - ID: ${id}, Response:`, JSON.stringify({
      id: result.id,
      totalAmount: result.totalAmount,
      itemsCount: result.items?.length
    }, null, 2));
    
    res.status(200).json({
      success: true,
      message: 'RFQ response updated successfully',
      data: result
    });
  } catch (error) {
    logger.error('Update RFQ response error:', error);
    next(error);
  }
};

export const createRFQResponse = async (req, res, next) => {
  try {
    const { rfqId } = req.params;
    let items = [];
    try {
      items = JSON.parse(req.body.items || '[]');
    } catch (e) {
      items = Array.isArray(req.body.items) ? req.body.items : [];
    }
    
    const notes = req.body.notes || null;
    const totalAmount = req.body.totalAmount ? parseFloat(req.body.totalAmount) : null;
    const currency = req.body.currency || 'USD';
    const validity = req.body.validity || null;
    
    // Handle files - quotationFile or attachment_* files
    const files = req.files || [];
    const quotationFile = files.find(f => f.fieldname === 'quotationFile') || null;
    const attachments = files.filter(f => f.fieldname.startsWith('attachment_'));
    
    let commercialTerms = null;
    if (req.body.commercialTerms) {
      try {
        commercialTerms = typeof req.body.commercialTerms === 'string' 
          ? JSON.parse(req.body.commercialTerms) 
          : req.body.commercialTerms;
      } catch (e) {
        commercialTerms = null;
      }
    }

    const result = await createRFQResponseService(rfqId, req.user.id, {
      items,
      notes,
      quotationFile,
      attachments,
      totalAmount,
      currency,
      validity,
      commercialTerms
    });
    
    // Check if this was an update or create
    const isUpdate = result._isUpdate === true;
    const message = isUpdate 
      ? 'Quotation updated successfully. Awaiting admin review.'
      : 'Quotation submitted successfully. Awaiting admin review.';
    
    // Remove internal flag before sending response
    if (result._isUpdate) {
      delete result._isUpdate;
    }
    
    res.status(isUpdate ? 200 : 201).json({
      success: true,
      message,
      data: result
    });
  } catch (error) {
    logger.error('Create RFQ response error:', error);
    next(error);
  }
};

export const getMyRFQResponses = async (req, res, next) => {
  try {
    logger.info(`[getMyRFQResponses] User: ${req.user.id}, Role: ${req.user.role}`);
    const result = await getMyRFQResponsesService(req.user.id);
    
    res.status(200).json({
      success: true,
      message: 'RFQ responses retrieved successfully',
      data: result
    });
  } catch (error) {
    logger.error('Get my RFQ responses error:', error);
    next(error);
  }
};

export const checkQuotationStatus = async (req, res, next) => {
  try {
    const { rfqId } = req.params;
    
    const supplier = await prisma.supplier.findFirst({
      where: {
        userId: req.user.id,
        deletedAt: null
      },
      select: { id: true }
    });

    if (!supplier) {
      throw new ApiError(404, 'Supplier not found');
    }

    const result = await checkSupplierQuotationStatus(rfqId, supplier.id);
    
    res.status(200).json({
      success: true,
      message: 'Quotation status retrieved successfully',
      data: result
    });
  } catch (error) {
    logger.error('Check quotation status error:', error);
    next(error);
  }
};

export const reviewQuotation = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      throw new ApiError(400, 'Quotation ID is required');
    }

    logger.info(`Review quotation request - ID: ${id}, User: ${req.user.id}`);

    const { action, adminNotes } = req.body;
    
    if (!action) {
      throw new ApiError(400, 'Action is required. Must be APPROVE or REJECT');
    }
    
    if (!['APPROVE', 'REJECT'].includes(action)) {
      throw new ApiError(400, 'Invalid action. Must be APPROVE or REJECT');
    }

    const quotation = await prisma.rFQResponse.findUnique({
      where: { id }
    });

    if (!quotation) {
      logger.error(`Quotation not found: ${id}`);
      throw new ApiError(404, 'Quotation not found');
    }

    const allowedStatuses = ['SUBMITTED', 'UNDER_REVIEW', 'REJECTED', 'CONFIRMED', 'ACCEPTED', 'SENT_TO_BUYER', 'BUYER_ACCEPTED'];
    if (!allowedStatuses.includes(quotation.status)) {
      logger.error(`Invalid status for review: ${quotation.status} (ID: ${id})`);
      throw new ApiError(400, `Quotation cannot be reviewed. Current status: ${quotation.status}. Allowed statuses: ${allowedStatuses.join(', ')}`);
    }

    const result = await reviewSupplierQuotationService(id, req.user, action, adminNotes);

    if (req.user) {
      const { logAdminAction } = await import('../../utils/auditLogger.js');
      await logAdminAction({
        user: { id: req.user.id, email: req.user.email, role: req.user.role },
        action: action === 'APPROVE' ? 'QUOTATION_APPROVE' : 'QUOTATION_REJECT',
        resourceType: 'Quotation',
        resourceId: id,
        newValue: adminNotes ? { adminNotes } : undefined,
        req,
      });
    }

    res.status(200).json({
      success: true,
      message: `Quotation ${action === 'APPROVE' ? 'approved' : 'rejected'} successfully`,
      data: result
    });
  } catch (error) {
    if (error instanceof ApiError) {
      logger.error(`Review quotation error [${error.statusCode}]:`, error.message);
      return next(error);
    }
    logger.error('Review quotation unexpected error:', error);
    next(error);
  }
};

export const resubmitQuotation = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      throw new ApiError(400, 'Quotation ID is required');
    }

    logger.info(`Resubmit quotation request - ID: ${id}, User: ${req.user.id}`);

    let items = [];
    try {
      items = JSON.parse(req.body.items || '[]');
    } catch (e) {
      items = Array.isArray(req.body.items) ? req.body.items : [];
    }
    
    const notes = req.body.notes || null;
    const totalAmount = req.body.totalAmount ? parseFloat(req.body.totalAmount) : null;
    const currency = req.body.currency || 'USD';
    const validity = req.body.validity || null;
    
    const files = req.files || [];
    const quotationFile = files.find(f => f.fieldname === 'quotationFile') || null;
    const attachments = files.filter(f => f.fieldname.startsWith('attachment_'));
    
    let commercialTerms = null;
    if (req.body.commercialTerms) {
      try {
        commercialTerms = typeof req.body.commercialTerms === 'string' 
          ? JSON.parse(req.body.commercialTerms) 
          : req.body.commercialTerms;
      } catch (e) {
        commercialTerms = null;
      }
    }

    const result = await resubmitQuotationService(id, req.user.id, {
      items,
      notes,
      quotationFile,
      attachments,
      totalAmount,
      currency,
      validity,
      commercialTerms
    });
    
    res.status(200).json({
      success: true,
      message: 'Quotation resubmitted successfully. Awaiting admin review.',
      data: result
    });
  } catch (error) {
    logger.error('Resubmit quotation error:', error);
    next(error);
  }
};

export const sendToBuyer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const editedData = req.body;

    const result = await sendQuotationToBuyerService(id, req.user, editedData);

    res.status(200).json({
      success: true,
      message: 'Quotation sent to buyer successfully',
      data: result
    });
  } catch (error) {
    logger.error('Send to buyer error:', error);
    next(error);
  }
};

export const sendBackToSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await sendBackToSupplierService(id, req.user);
    res.status(200).json({
      success: true,
      message: 'Quotation sent back to supplier successfully',
      data: result
    });
  } catch (error) {
    logger.error('Send back to supplier error:', error);
    next(error);
  }
};

export const sendNegotiationToSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await sendNegotiationToSupplierService(id, req.user);
    res.status(200).json({
      success: true,
      message: 'Negotiation sent to supplier successfully',
      data: result
    });
  } catch (error) {
    logger.error('Send negotiation to supplier error:', error);
    next(error);
  }
};

export const submitNegotiationResponse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await submitNegotiationResponseService(id, req.user.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Negotiation response submitted successfully',
      data: result
    });
  } catch (error) {
    logger.error('Submit negotiation response error:', error);
    next(error);
  }
};
