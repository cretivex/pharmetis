import prisma from '../../config/database.js';
import { Prisma } from '@prisma/client';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';
import { createRFQHistoryEntry } from '../rfqs/rfq-history.service.js';
import { createAdminNotifications } from '../notifications/notifications.service.js';
import { 
  canBuyerAcceptQuotation, 
  canBuyerRequestLowerPrice,
  canBuyerRejectQuotation,
  validateQuotationStatusTransition 
} from '../../utils/statusValidation.js';

export const createBuyerRFQService = async (buyerId, data) => {
  try {
    const { title, notes, expiresAt, expectedDelivery, items } = data;

    if (!items || items.length === 0) {
      throw new ApiError(400, 'At least one product item is required');
    }

    const rfqTitle = title || `RFQ - ${items.length} product(s)`;

    const rfq = await prisma.rFQ.create({
      data: {
        buyerId,
        title: rfqTitle,
        notes: notes || null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        expectedDelivery: expectedDelivery ? new Date(expectedDelivery) : null,
        status: 'OPEN',
        items: {
          create: items.map(item => ({
            productId: item.productId || null,
            productName: item.productName,
            quantity: item.quantity,
            unit: item.unit || 'units',
            notes: item.notes || null
          }))
        }
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        }
      }
    });

    await createAdminNotifications({
      title: 'New RFQ created',
      message: `RFQ "${rfqTitle}" has been created.`,
      link: `/rfq/${rfq.id}`,
      type: 'RFQ_CREATED'
    });

    logger.info(`Buyer RFQ created: ${rfq.id} by buyer ${buyerId}`);
    return rfq;
  } catch (error) {
    logger.error('Create buyer RFQ service error:', error);
    throw error;
  }
};

export const getBuyerRFQsService = async (buyerId, filters = {}) => {
  try {
    const {
      status
    } = filters;

    const where = {
      buyerId,
      deletedAt: null
    };

    // Validate status against RFQStatus enum
    const validStatuses = [
      'DRAFT', 'OPEN', 'SENT', 'RESPONDED', 'QUOTED', 'NEGOTIATION',
      'CONFIRMED', 'AWAITING_PAYMENT', 'IN_PROGRESS', 'SHIPPED',
      'COMPLETED', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED'
    ];

    if (status && status !== 'undefined' && status !== 'null' && validStatuses.includes(status)) {
      where.status = status;
    }

    const rfqs = await prisma.rFQ.findMany({
      where,
      include: {
        items: true,
        selectedQuotation: {
          include: {
            items: true,
            supplier: {
              select: {
                id: true,
                companyName: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform to hide sensitive data and filter selectedQuotation by status
    const validQuotationStatuses = ['SENT_TO_BUYER', 'BUYER_ACCEPTED', 'NEGOTIATION_REQUESTED'];
    const transformedRFQs = rfqs.map(rfq => {
      const rfqData = {
        ...rfq,
        createdAt: rfq.createdAt ? new Date(rfq.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: rfq.updatedAt ? new Date(rfq.updatedAt).toISOString() : new Date().toISOString()
      };

      // Filter selectedQuotation by status (only show if status is valid for buyer)
      if (rfq.selectedQuotation && validQuotationStatuses.includes(rfq.selectedQuotation.status)) {
        rfqData.selectedQuotation = {
          ...rfq.selectedQuotation,
          finalPrice: rfq.selectedQuotation.adminFinalPrice || rfq.selectedQuotation.totalAmount,
          createdAt: rfq.selectedQuotation.createdAt ? new Date(rfq.selectedQuotation.createdAt).toISOString() : new Date().toISOString(),
          updatedAt: rfq.selectedQuotation.updatedAt ? new Date(rfq.selectedQuotation.updatedAt).toISOString() : new Date().toISOString()
        };
        delete rfqData.selectedQuotation.totalAmount;
        delete rfqData.selectedQuotation.supplierPrice;
        delete rfqData.selectedQuotation.marginPercent;
      } else {
        delete rfqData.selectedQuotation;
      }

      return rfqData;
    });

    return transformedRFQs;
  } catch (error) {
    logger.error('Get buyer RFQs service error:', error);
    throw error;
  }
};

export const getBuyerRFQByIdService = async (id, buyerId) => {
  try {
    if (!id || !buyerId) {
      throw new ApiError(400, 'RFQ ID and buyer ID are required');
    }

    const rfq = await prisma.rFQ.findFirst({
      where: {
        id,
        buyerId,
        deletedAt: null
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true
              }
            }
          }
        },
        selectedQuotation: {
          include: {
            items: true,
            supplier: {
              select: {
                id: true,
                companyName: true,
                city: true,
                country: true
              }
            }
          }
        }
      }
    });

    if (!rfq) {
      return null;
    }

    // Format dates
    const rfqData = {
      ...rfq,
      createdAt: rfq.createdAt ? new Date(rfq.createdAt).toISOString() : new Date().toISOString(),
      updatedAt: rfq.updatedAt ? new Date(rfq.updatedAt).toISOString() : new Date().toISOString(),
      expiresAt: rfq.expiresAt ? new Date(rfq.expiresAt).toISOString() : null,
      expectedDelivery: rfq.expectedDelivery ? new Date(rfq.expectedDelivery).toISOString() : null
    };

    // Filter out sensitive data - buyer should only see adminFinalPrice, not original supplier price
    // Also filter by status - only show quotations with valid buyer-visible statuses
    const validQuotationStatuses = ['SENT_TO_BUYER', 'BUYER_ACCEPTED', 'NEGOTIATION_REQUESTED'];
    
    if (rfq.selectedQuotation && validQuotationStatuses.includes(rfq.selectedQuotation.status)) {
      rfqData.selectedQuotation = {
        ...rfq.selectedQuotation,
        finalPrice: rfq.selectedQuotation.adminFinalPrice || rfq.selectedQuotation.totalAmount,
        createdAt: rfq.selectedQuotation.createdAt ? new Date(rfq.selectedQuotation.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: rfq.selectedQuotation.updatedAt ? new Date(rfq.selectedQuotation.updatedAt).toISOString() : new Date().toISOString(),
        validity: rfq.selectedQuotation.validity ? new Date(rfq.selectedQuotation.validity).toISOString() : null,
        items: rfq.selectedQuotation.items.map(item => ({
          ...item,
          finalUnitPrice: item.unitPrice,
          finalTotalPrice: item.totalPrice
        }))
      };
      delete rfqData.selectedQuotation.totalAmount;
      delete rfqData.selectedQuotation.supplierPrice;
      delete rfqData.selectedQuotation.marginPercent;
    } else {
      rfqData.selectedQuotation = null;
    }

    return rfqData;
  } catch (error) {
    logger.error('Get buyer RFQ by ID service error:', error);
    throw error;
  }
};

export const acceptBuyerQuotationService = async (quotationId, buyerId) => {
  try {
    const quotation = await prisma.rFQResponse.findUnique({
      where: { id: quotationId },
      include: { 
        rfq: true,
        items: true
      }
    });

    if (!quotation) {
      throw new ApiError(404, 'Quotation not found');
    }

    if (quotation.rfq.buyerId !== buyerId) {
      throw new ApiError(403, 'You do not have access to this quotation');
    }

    if (quotation.status !== 'SENT_TO_BUYER') {
      throw new ApiError(400, `Cannot accept quotation. Current status: ${quotation.status}. Only SENT_TO_BUYER quotations can be accepted.`);
    }

    const finalPrice = parseFloat(quotation.adminFinalPrice) || parseFloat(quotation.totalAmount) || quotation.items.reduce((sum, item) => {
      return sum + (parseFloat(item.totalPrice) || 0);
    }, 0);

    await prisma.$transaction([
      prisma.rFQResponse.update({
        where: { id: quotationId },
        data: { status: 'BUYER_ACCEPTED' }
      }),
      prisma.rFQ.update({
        where: { id: quotation.rfqId },
        data: {
          status: 'QUOTATION_ACCEPTED',
          selectedQuotationId: quotationId,
          totalAmount: finalPrice,
          paidAmount: 0,
          remainingAmount: finalPrice,
          paymentStatus: 'PENDING'
        }
      })
    ]);

    logger.info(`Quotation ${quotationId} accepted by buyer ${buyerId}. RFQ ${quotation.rfqId} updated to QUOTATION_ACCEPTED.`);

    // BUYER_ACCEPTED history
    await createRFQHistoryEntry({
      rfqId: quotation.rfqId,
      responseId: quotationId,
      actorRole: 'BUYER',
      actorId: buyerId,
      action: 'BUYER_ACCEPTED',
      note: null
    });

    await createAdminNotifications({
      title: 'Buyer accepted quotation',
      message: `A buyer accepted a quotation for RFQ "${quotation.rfq?.title || 'RFQ'}".`,
      link: `/quotations`,
      type: 'BUYER_ACCEPTED'
    });
    
    return { rfqId: quotation.rfqId };
  } catch (error) {
    logger.error('Accept buyer quotation service error:', error);
    throw error;
  }
};

export const rejectBuyerQuotationService = async (quotationId, buyerId) => {
  try {
    const quotation = await prisma.rFQResponse.findUnique({
      where: { id: quotationId },
      include: { rfq: true }
    });

    if (!quotation) {
      throw new ApiError(404, 'Quotation not found');
    }

    if (quotation.rfq.buyerId !== buyerId) {
      throw new ApiError(403, 'You do not have access to this quotation');
    }

    if (quotation.status !== 'SENT_TO_BUYER') {
      throw new ApiError(400, `Cannot reject quotation. Current status: ${quotation.status}. Only SENT_TO_BUYER quotations can be rejected.`);
    }

    // When buyer rejects a quotation, mark the quotation as REJECTED
    // and also update the parent RFQ status so it appears under the
    // "Rejected" filter in the buyer My RFQs page.
    await prisma.$transaction([
      prisma.rFQResponse.update({
        where: { id: quotationId },
        data: {
          status: 'REJECTED'
        }
      }),
      prisma.rFQ.update({
        where: { id: quotation.rfqId },
        data: {
          status: 'REJECTED'
        }
      })
    ]);

    logger.info(`Quotation ${quotationId} rejected by buyer ${buyerId}`);

    // BUYER_REJECTED history
    await createRFQHistoryEntry({
      rfqId: quotation.rfqId,
      responseId: quotationId,
      actorRole: 'BUYER',
      actorId: buyerId,
      action: 'BUYER_REJECTED',
      note: null
    });
  } catch (error) {
    logger.error('Reject buyer quotation service error:', error);
    throw error;
  }
};

export const requestLowerPriceService = async (quotationId, buyerId, data) => {
  try {
    const { requestedPrice, message } = data;

    const quotation = await prisma.rFQResponse.findUnique({
      where: { id: quotationId },
      include: { rfq: true }
    });

    if (!quotation) {
      throw new ApiError(404, 'Quotation not found');
    }

    if (quotation.rfq.buyerId !== buyerId) {
      throw new ApiError(403, 'You do not have access to this quotation');
    }

    if (quotation.status === 'NEGOTIATION_REQUESTED') {
      throw new ApiError(400, 'Price negotiation already requested. Waiting for supplier response.');
    }

    if (quotation.status !== 'SENT_TO_BUYER') {
      throw new ApiError(400, `Cannot request lower price. Current status: ${quotation.status}. Only SENT_TO_BUYER quotations can be negotiated.`);
    }

    const finalPrice = parseFloat(quotation.adminFinalPrice) || parseFloat(quotation.totalAmount) || 0;
    
    if (requestedPrice >= finalPrice) {
      throw new ApiError(400, 'Requested price must be lower than the current price');
    }

    const revisionByStr = buyerId != null ? String(buyerId) : null;
    await prisma.rFQResponse.update({
      where: { id: quotationId },
      data: {
        status: 'NEGOTIATION_REQUESTED',
        buyerRequestedPrice: Number(requestedPrice),
        negotiationMessage: message ?? null,
        negotiationRequested: true,
        revisionNote: message ?? null,
        revisionRequestedAt: new Date(),
        revisionBy: revisionByStr
      }
    });

    await createRFQHistoryEntry({
      rfqId: quotation.rfqId,
      responseId: quotationId,
      actorRole: 'BUYER',
      actorId: String(buyerId),
      action: 'BUYER_REQUESTED_LOWER_PRICE',
      note: message ?? null
    });

    await createAdminNotifications({
      title: 'Buyer requested lower price',
      message: `A buyer requested a lower price for a quotation (RFQ "${quotation.rfq?.title || 'RFQ'}").`,
      link: `/quotations`,
      type: 'BUYER_REQUESTED_LOWER_PRICE'
    });

    logger.info(`Price negotiation requested for quotation ${quotationId} by buyer ${buyerId}`);
  } catch (error) {
    logger.error('Request lower price service error:', error);
    if (error && error.code === 'P2025') {
      throw new ApiError(404, 'Quotation not found');
    }
    throw error;
  }
};
