import { createRFQService, getRFQsService, getRFQByIdService, updateRFQService, deleteRFQService, getAssignedRFQsService, checkSupplierAssignedToRFQ, processPaymentService, completeRFQService, sendRFQToSuppliersService } from './rfqs.service.js';
import { getRFQHistoryService } from './rfq-history.service.js';
import prisma from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';

export const createRFQ = async (req, res, next) => {
  try {
    const result = await createRFQService(req.user.id, req.body);
    res.status(201).json({
      success: true,
      message: 'RFQ created successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getRFQs = async (req, res, next) => {
  try {
    // For admin, get all RFQs; for buyers, filter by buyerId
    const userId = req.user.role === 'ADMIN' ? null : req.user.id;
    const result = await getRFQsService(userId, req.query);
    res.status(200).json({
      success: true,
      message: 'RFQs retrieved successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getRFQById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, id: userId } = req.user;
    
    let rfq;
    
    if (role === 'ADMIN') {
      // Admin: Full RFQ data with buyer details and internal notes
      rfq = await getRFQByIdService(id, null, req.user);
    } else if (role === 'BUYER') {
      // Buyer: Full RFQ data for their own RFQs
      rfq = await getRFQByIdService(id, userId, req.user);
    } else if (role === 'VENDOR') {
      // Supplier: Verify assignment and return filtered data
      const supplier = await prisma.supplier.findFirst({
        where: {
          userId,
          deletedAt: null
        },
        select: { id: true }
      });

      if (!supplier) {
        logger.warn(`Supplier not found for user ${userId}`);
        throw new ApiError(404, 'Supplier profile not found. Please complete your supplier profile.');
      }

      // Verify RFQ exists and is accessible
      const rfqExists = await prisma.rFQ.findUnique({
        where: { id },
        select: { id: true, deletedAt: true, status: true, expiresAt: true }
      });

      if (!rfqExists || rfqExists.deletedAt) {
        logger.warn(`RFQ ${id} not found or deleted`);
        throw new ApiError(404, 'RFQ not found');
      }

      // Check if supplier has already responded
      const existingResponse = await prisma.rFQResponse.findFirst({
        where: {
          rfqId: id,
          supplierId: supplier.id
        },
        select: { id: true, status: true }
      });

      // If RFQ is SENT and supplier hasn't responded, check assignment
      // Also allow access if supplier has already responded (to view/edit their response)
      if (rfqExists.status === 'SENT' && !existingResponse) {
        const isAssigned = await checkSupplierAssignedToRFQ(supplier.id, id);
        if (!isAssigned) {
          logger.warn(`Supplier ${supplier.id} not assigned to RFQ ${id}`);
          throw new ApiError(403, 'You do not have access to this RFQ. This RFQ may not have been sent to you.');
        }
      }
      
      // Allow access if supplier has already responded (to view their response)
      // Also allow access for other statuses like OPEN, RESPONDED, etc.

      // Get full RFQ data
      rfq = await getRFQByIdService(id, null, req.user);
      
      // Return filtered data for supplier (hide buyer email, internal notes)
      // Include all necessary fields for the frontend
      rfq = {
        id: rfq.id,
        title: rfq.title || `RFQ-${rfq.id.substring(0, 8)}`,
        status: rfq.status,
        expiresAt: rfq.expiresAt,
        expectedDelivery: rfq.expectedDelivery,
        createdAt: rfq.createdAt,
        updatedAt: rfq.updatedAt,
        notes: rfq.notes || null, // Public notes only
        items: (rfq.items || []).map(item => ({
          id: item.id,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unit: item.unit,
          notes: item.notes || null,
          product: item.product ? {
            id: item.product.id,
            name: item.product.name,
            slug: item.product.slug,
            price: item.product.price
          } : null
        })),
        buyer: rfq.buyer ? {
          id: rfq.buyer.id,
          fullName: rfq.buyer.fullName || 'Buyer',
          companyName: rfq.buyer.companyName || null
          // Don't include email for privacy
        } : null
      };
    } else {
      throw new ApiError(403, 'Access denied');
    }
    
    res.status(200).json({
      success: true,
      message: 'RFQ retrieved successfully',
      data: rfq
    });
  } catch (error) {
    next(error);
  }
};

export const updateRFQ = async (req, res, next) => {
  try {
    const { id } = req.params;
    // For admin, allow updating any RFQ; for buyers, filter by buyerId
    const userId = req.user.role === 'ADMIN' ? null : req.user.id;
    const result = await updateRFQService(id, userId, req.body);
    res.status(200).json({
      success: true,
      message: 'RFQ updated successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRFQ = async (req, res, next) => {
  try {
    const { id } = req.params;
    // For admin, allow deleting any RFQ; for buyers, filter by buyerId
    const userId = req.user.role === 'ADMIN' ? null : req.user.id;
    await deleteRFQService(id, userId);
    res.status(200).json({
      success: true,
      message: 'RFQ deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getAssignedRFQs = async (req, res, next) => {
  try {
    logger.info(`[getAssignedRFQs] User: ${req.user.id}, Role: ${req.user.role}`);
    // For suppliers, get RFQs they can respond to (status SENT and not yet responded)
    const result = await getAssignedRFQsService(req.user.id);
    res.status(200).json({
      success: true,
      message: 'Assigned RFQs retrieved successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const sendRFQToSuppliers = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { supplierIds } = req.body;

    if (!Array.isArray(supplierIds)) {
      throw new ApiError(400, 'supplierIds must be an array');
    }

    const result = await sendRFQToSuppliersService(id, supplierIds, req.user.id);

    if (req.user) {
      const { logAdminAction } = await import('../../utils/auditLogger.js');
      await logAdminAction({
        user: { id: req.user.id, email: req.user.email, role: req.user.role },
        action: 'RFQ_SEND',
        resourceType: 'RFQ',
        resourceId: id,
        newValue: { supplierCount: result?.suppliersSent, supplierIds },
        req,
      });
    }

    res.status(200).json({
      success: true,
      message: `RFQ sent to ${result.suppliersSent} supplier(s) successfully`,
      data: result
    });
  } catch (error) {
    logger.error('Send RFQ to suppliers error:', error);
    next(error);
  }
};

export const processPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { paymentType, amount } = req.body;

    logger.info(`Process payment request - RFQ ID: ${id}, User: ${req.user.id}, Type: ${paymentType}, Amount: ${amount}`);

    if (!paymentType) {
      return res.status(400).json({ 
        success: false,
        message: 'Payment type required' 
      });
    }

    if (req.user.role !== 'BUYER') {
      throw new ApiError(403, 'Only buyers can process payments');
    }

    const result = await processPaymentService(id, req.user.id, { paymentType, amount });

    const { logAdminAction } = await import('../../utils/auditLogger.js');
    await logAdminAction({
      user: { id: req.user.id, email: req.user.email, role: req.user.role },
      action: 'RFQ_PAYMENT',
      resourceType: 'RFQ',
      resourceId: id,
      newValue: { paymentType, amount: amount ?? null },
      req,
    });

    res.status(200).json({
      success: true,
      message: `Payment processed successfully. ${paymentType === 'FULL' ? 'Full payment completed.' : paymentType === 'REMAINING' ? 'Remaining balance paid.' : `Payment of ${amount} processed.`}`,
      data: result
    });
  } catch (error) {
    logger.error('Process payment error:', error);
    logger.error('Error details:', {
      message: error.message,
      statusCode: error.statusCode,
      stack: error.stack
    });
    
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message || 'Payment processing failed'
      });
    }
    
    next(error);
  }
};

export const completeRFQ = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (req.user.role !== 'BUYER') {
      throw new ApiError(403, 'Only buyers can mark RFQ as completed');
    }

    const result = await completeRFQService(id, req.user.id);

    const { logAdminAction } = await import('../../utils/auditLogger.js');
    await logAdminAction({
      user: { id: req.user.id, email: req.user.email, role: req.user.role },
      action: 'RFQ_COMPLETE',
      resourceType: 'RFQ',
      resourceId: id,
      req,
    });

    res.status(200).json({
      success: true,
      message: 'RFQ marked as completed successfully',
      data: result
    });
  } catch (error) {
    logger.error('Complete RFQ error:', error);
    next(error);
  }
};

export const getRFQHistory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const history = await getRFQHistoryService(id, req.user);

    res.status(200).json({
      success: true,
      message: 'RFQ history retrieved successfully',
      data: history
    });
  } catch (error) {
    // Preserve meaningful ApiError status codes (403/404) so frontend
    // can distinguish "no access" or "no history" from real server errors.
    if (error instanceof ApiError && error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
        data: []
      });
    }

    logger.error('RFQ History Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch history',
      data: []
    });
  }
};

