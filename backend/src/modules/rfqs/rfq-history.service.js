import prisma from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';

export const createRFQHistoryEntry = async ({
  rfqId,
  responseId = null,
  actorRole,
  actorId,
  action,
  note = null
}) => {
  try {
    if (!rfqId || !actorRole || !actorId || !action) {
      logger.warn('RFQ history missing required fields', { rfqId, actorRole, actorId, action });
      return null;
    }

    return await prisma.rFQHistory.create({
      data: {
        rfqId,
        responseId,
        actorRole,
        actorId,
        action,
        note
      }
    });
  } catch (error) {
    logger.error('Create RFQ history entry error:', error);
    // Do not block main flow on history failure
    return null;
  }
};

export const getRFQHistoryService = async (rfqId, user) => {
  try {
    const rfq = await prisma.rFQ.findUnique({
      where: { id: rfqId },
      select: {
        id: true,
        buyerId: true
      }
    });

    if (!rfq) {
      throw new ApiError(404, 'RFQ not found');
    }

    // Admin can always see
    if (user.role !== 'ADMIN') {
      // Buyer: must own RFQ
      if (user.role === 'BUYER') {
        if (rfq.buyerId !== user.id) {
          throw new ApiError(403, 'You do not have access to this RFQ history');
        }
      } else if (user.role === 'VENDOR') {
        // Supplier: must be assigned / have a response on this RFQ
        const supplier = await prisma.supplier.findFirst({
          where: {
            userId: user.id,
            deletedAt: null
          },
          select: { id: true }
        });

        if (!supplier) {
          throw new ApiError(404, 'Supplier not found');
        }

        const hasResponse = await prisma.rFQResponse.findFirst({
          where: {
            rfqId,
            supplierId: supplier.id
          },
          select: { id: true }
        });

        if (!hasResponse) {
          throw new ApiError(403, 'You do not have access to this RFQ history');
        }
      } else {
        throw new ApiError(403, 'You do not have access to this RFQ history');
      }
    }

    const history = await prisma.rFQHistory.findMany({
      where: { rfqId },
      orderBy: {
        createdAt: 'desc'
      }
    }).catch((error) => {
      logger.error('Error fetching RFQ history from database:', error);
      return [];
    });

    return history || [];
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    logger.error('Get RFQ history service error:', error);
    throw new ApiError(500, 'Failed to fetch RFQ history');
  }
};

