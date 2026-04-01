import prisma from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';

/**
 * Get all buyers with pagination and filters
 */
export const getAllBuyersService = async (query = {}) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      status = 'all',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = query;

    // Safe pagination parsing with validation
    const pageNum = parseInt(String(page), 10);
    const limitNum = parseInt(String(limit), 10);
    
    if (isNaN(pageNum) || pageNum < 1) {
      throw new ApiError(400, 'Invalid page number');
    }
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      throw new ApiError(400, 'Invalid limit (must be between 1 and 100)');
    }

    const skip = (pageNum - 1) * limitNum;
    const take = limitNum;
    
    logger.debug('Buyers service - Pagination:', { page: pageNum, limit: limitNum, skip, take });

    // Build where clause
    const where = {
      role: 'BUYER',
      deletedAt: null
    };

    // Search filter
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Status filter (active/suspended)
    if (status === 'active') {
      where.deletedAt = null;
    } else if (status === 'suspended') {
      where.deletedAt = { not: null };
    }

    // Get buyers with aggregated data
    let buyers = [];
    let total = 0;
    
    try {
      [buyers, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take,
          orderBy: {
            [sortBy]: sortOrder
          },
          select: {
            id: true,
            email: true,
            fullName: true,
            companyName: true,
            country: true,
            city: true,
            phone: true,
            avatar: true,
            createdAt: true,
            deletedAt: true,
            _count: {
              select: {
                rfqs: true
              }
            }
          }
        }),
        prisma.user.count({ where })
      ]);
      logger.debug('Buyers fetched:', buyers.length, 'Total:', total);
    } catch (error) {
      logger.error('Error fetching buyers from database:', error);
      throw new ApiError(500, 'Failed to fetch buyers from database');
    }

    const buyersWithStats = buyers.map((buyer) => ({
      ...buyer,
      totalRFQs: buyer._count?.rfqs || 0,
      totalSpend: 0,
      status: buyer.deletedAt ? 'suspended' : 'active'
    }));

    const totalPages = total > 0 ? Math.ceil(total / take) : 0;

    const result = {
      buyers: buyersWithStats || [],
      pagination: {
        page: pageNum,
        limit: take,
        total: total || 0,
        totalPages: totalPages || 0
      }
    };

    logger.debug('Buyers service result:', {
      buyersCount: result.buyers.length,
      pagination: result.pagination
    });

    return result;
  } catch (error) {
    logger.error('🔥 Get All Buyers Service Error:', error);
    logger.error('Stack:', error.stack);
    logger.error('Get all buyers service error:', error);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError(500, 'Failed to fetch buyers');
  }
};

/**
 * Get buyer by ID with full details
 */
export const getBuyerByIdService = async (buyerId) => {
  try {
    logger.debug('Get buyer by ID service - ID:', buyerId);

    // First verify buyer exists and is a BUYER
    const buyer = await prisma.user.findFirst({
      where: {
        id: buyerId,
        role: 'BUYER',
        deletedAt: null
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        companyName: true,
        country: true,
        city: true,
        phone: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        emailVerified: true
      }
    });

    if (!buyer) {
      logger.warn('Buyer not found - ID:', buyerId);
      throw new ApiError(404, 'Buyer not found');
    }

    logger.debug('Buyer found:', buyer.id, buyer.email);

    // Safely fetch companyInfo (may not exist)
    let companyInfo = null;
    try {
      const userWithCompany = await prisma.user.findFirst({
        where: { id: buyerId },
        select: {
          companyInfo: {
            select: {
              gstNumber: true,
              drugLicenseNumber: true,
              businessType: true,
              website: true
            }
          }
        }
      });
      companyInfo = userWithCompany?.companyInfo || null;
    } catch (error) {
      logger.warn('Error fetching companyInfo for buyer:', buyerId, error);
      // Continue without companyInfo
    }

    let counts = { rfqs: 0, payments: 0 };
    try {
      const [rfqsCount, paymentsCount] = await Promise.all([
        prisma.rFQ.count({ where: { buyerId: buyer.id, deletedAt: null } }),
        prisma.payment.count({ where: { buyerId: buyer.id } })
      ]);
      counts = { rfqs: rfqsCount, payments: paymentsCount };
    } catch (error) {
      logger.warn('Error fetching counts for buyer:', buyerId, error);
    }

    return {
      ...buyer,
      companyInfo: companyInfo,
      _count: counts,
      totalSpend: 0,
      status: buyer.deletedAt ? 'suspended' : 'active'
    };
  } catch (error) {
    logger.error('🔥 Get Buyer By ID Service Error:', error);
    logger.error('Stack:', error.stack);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    logger.error('Get buyer by ID service error:', error);
    throw new ApiError(500, 'Failed to fetch buyer details');
  }
};

/**
 * Get buyer RFQs
 */
export const getBuyerRFQsService = async (buyerId, query = {}) => {
  try {
    logger.debug('Get buyer RFQs service - ID:', buyerId, 'Query:', query);

    // First verify buyer exists
    const buyer = await prisma.user.findFirst({
      where: {
        id: buyerId,
        role: 'BUYER',
        deletedAt: null
      },
      select: { id: true }
    });

    if (!buyer) {
      logger.warn('Buyer not found for RFQs - ID:', buyerId);
      throw new ApiError(404, 'Buyer not found');
    }

    const {
      page = 1,
      limit = 20,
      status = 'all'
    } = query;

    // Safe pagination parsing
    const pageNum = parseInt(String(page), 10);
    const limitNum = parseInt(String(limit), 10);
    
    if (isNaN(pageNum) || pageNum < 1) {
      throw new ApiError(400, 'Invalid page number');
    }
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      throw new ApiError(400, 'Invalid limit (must be between 1 and 100)');
    }

    const skip = (pageNum - 1) * limitNum;
    const take = limitNum;

    const where = {
      buyerId: buyerId,
      deletedAt: null
    };

    if (status !== 'all') {
      where.status = status;
    }

    let rfqs = [];
    let total = 0;

    try {
      // Fetch RFQs with items (required relation)
      [rfqs, total] = await Promise.all([
        prisma.rFQ.findMany({
          where,
          skip,
          take,
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            id: true,
            title: true,
            status: true,
            expectedDelivery: true,
            expiresAt: true,
            createdAt: true,
            updatedAt: true,
            selectedQuotationId: true,
            items: {
              select: {
                id: true,
                productName: true,
                quantity: true,
                unit: true
              }
            }
          }
        }),
        prisma.rFQ.count({ where })
      ]);

      // Fetch selectedQuotation separately (optional relation, safer)
      if (rfqs.length > 0) {
        const quotationIds = rfqs
          .map(rfq => rfq.selectedQuotationId)
          .filter(id => id !== null && id !== undefined);
        
        if (quotationIds.length > 0) {
          try {
            const quotations = await prisma.rFQResponse.findMany({
              where: {
                id: { in: quotationIds }
              },
              select: {
                id: true,
                totalAmount: true,
                status: true
              }
            });

            const quotationMap = new Map(quotations.map(q => [q.id, { ...q, totalPrice: q.totalAmount }]));
            
            // Attach selectedQuotation to each RFQ
            rfqs = rfqs.map(rfq => ({
              ...rfq,
              selectedQuotation: rfq.selectedQuotationId 
                ? (quotationMap.get(rfq.selectedQuotationId) || null)
                : null
            }));
          } catch (quotationError) {
            logger.warn('Error fetching selected quotations:', quotationError);
            // Continue without selectedQuotation data
            rfqs = rfqs.map(rfq => ({
              ...rfq,
              selectedQuotation: null
            }));
          }
        } else {
          // No selected quotations, set to null for all
          rfqs = rfqs.map(rfq => ({
            ...rfq,
            selectedQuotation: null
          }));
        }
      }
    } catch (error) {
      logger.error('🔥 Error fetching RFQs from database:', error);
      logger.error('Stack:', error.stack);
      logger.error('Error fetching RFQs:', error);
      
      // Check for Prisma-specific errors
      if (error.code === 'P2025') {
        throw new ApiError(404, 'RFQ not found');
      }
      if (error.code === 'P2023') {
        throw new ApiError(400, 'Invalid RFQ ID format');
      }
      
      throw new ApiError(500, 'Failed to fetch buyer RFQs from database');
    }

    const totalPages = total > 0 ? Math.ceil(total / take) : 0;

    return {
      rfqs: rfqs || [],
      pagination: {
        page: pageNum,
        limit: take,
        total: total || 0,
        totalPages: totalPages || 0
      }
    };
  } catch (error) {
    logger.error('🔥 Get Buyer RFQs Service Error:', error);
    logger.error('Stack:', error.stack);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    logger.error('Get buyer RFQs service error:', error);
    throw new ApiError(500, 'Failed to fetch buyer RFQs');
  }
};

/**
 * Get buyer payments
 */
export const getBuyerPaymentsService = async (buyerId, query = {}) => {
  try {
    logger.debug('Get buyer payments service - ID:', buyerId, 'Query:', query);

    // First verify buyer exists
    const buyer = await prisma.user.findFirst({
      where: {
        id: buyerId,
        role: 'BUYER',
        deletedAt: null
      },
      select: { id: true }
    });

    if (!buyer) {
      logger.warn('Buyer not found for payments - ID:', buyerId);
      throw new ApiError(404, 'Buyer not found');
    }

    const {
      page = 1,
      limit = 20,
      status = 'all'
    } = query;

    // Safe pagination parsing
    const pageNum = parseInt(String(page), 10);
    const limitNum = parseInt(String(limit), 10);
    
    if (isNaN(pageNum) || pageNum < 1) {
      throw new ApiError(400, 'Invalid page number');
    }
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      throw new ApiError(400, 'Invalid limit (must be between 1 and 100)');
    }

    const skip = (pageNum - 1) * limitNum;
    const take = limitNum;

    const where = {
      buyerId: buyerId
      // Note: Payment model does NOT have deletedAt field
    };

    if (status !== 'all') {
      where.status = status;
    }

    let payments = [];
    let total = 0;

    try {
      logger.debug('Fetching payments - where clause:', JSON.stringify(where));
      
      // First fetch payments without relations to avoid foreign key issues
      [payments, total] = await Promise.all([
        prisma.payment.findMany({
          where,
          skip,
          take,
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            id: true,
            amount: true,
            currency: true,
            paymentType: true,
            status: true,
            transactionId: true,
            gateway: true,
            createdAt: true,
            updatedAt: true,
            confirmedAt: true,
            rfqId: true,
            quotationId: true
          }
        }),
        prisma.payment.count({ where })
      ]);
      
      logger.debug(`Fetched ${payments.length} payments, total: ${total}`);

      // Fetch related RFQ and Quotation data separately (safer approach)
      if (payments.length > 0) {
        const rfqIds = [...new Set(payments.map(p => p.rfqId).filter(Boolean))];
        const quotationIds = [...new Set(payments.map(p => p.quotationId).filter(Boolean))];

        let rfqsMap = new Map();
        let quotationsMap = new Map();

        // Fetch RFQs separately with error handling
        if (rfqIds.length > 0) {
          try {
            const rfqs = await prisma.rFQ.findMany({
              where: { 
                id: { in: rfqIds },
                deletedAt: null  // Only fetch non-deleted RFQs
              },
              select: {
                id: true,
                title: true
              }
            });
            rfqsMap = new Map(rfqs.map(r => [r.id, r]));
            logger.debug(`Fetched ${rfqs.length} RFQs for ${rfqIds.length} payment RFQ IDs`);
          } catch (rfqError) {
            logger.error('🔥 Error fetching RFQs for payments:', rfqError);
            logger.warn('Error fetching RFQs for payments:', rfqError);
            // Continue with empty map - payments will have null rfq
          }
        }

        // Fetch Quotations separately with error handling
        if (quotationIds.length > 0) {
          try {
            const quotations = await prisma.rFQResponse.findMany({
              where: { id: { in: quotationIds } },
              select: {
                id: true,
                totalAmount: true,
                status: true
              }
            });
            quotationsMap = new Map(quotations.map(q => [q.id, { ...q, totalPrice: q.totalAmount }]));
            logger.debug(`Fetched ${quotations.length} quotations for ${quotationIds.length} payment quotation IDs`);
          } catch (quotationError) {
            logger.error('🔥 Error fetching quotations for payments:', quotationError);
            logger.warn('Error fetching quotations for payments:', quotationError);
            // Continue with empty map - payments will have null quotation
          }
        }

        // Attach related data to payments (safe - will be null if not found)
        payments = payments.map(payment => ({
          ...payment,
          rfq: payment.rfqId ? (rfqsMap.get(payment.rfqId) || null) : null,
          quotation: payment.quotationId ? (quotationsMap.get(payment.quotationId) || null) : null
        }));
      }
    } catch (error) {
      logger.error('🔥 Error fetching payments from database:', error);
      logger.error('Stack:', error.stack);
      logger.error('Error fetching payments:', error);
      
      // Check for Prisma-specific errors
      if (error.code === 'P2025') {
        throw new ApiError(404, 'Payment not found');
      }
      if (error.code === 'P2023') {
        throw new ApiError(400, 'Invalid payment ID format');
      }
      
      throw new ApiError(500, 'Failed to fetch buyer payments from database');
    }

    const totalPages = total > 0 ? Math.ceil(total / take) : 0;

    return {
      payments: payments || [],
      pagination: {
        page: pageNum,
        limit: take,
        total: total || 0,
        totalPages: totalPages || 0
      }
    };
  } catch (error) {
    logger.error('🔥 Get Buyer Payments Service Error:', error);
    logger.error('Stack:', error.stack);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    logger.error('Get buyer payments service error:', error);
    throw new ApiError(500, 'Failed to fetch buyer payments');
  }
};

/**
 * Suspend buyer (soft delete)
 */
export const suspendBuyerService = async (buyerId) => {
  try {
    const buyer = await prisma.user.findFirst({
      where: {
        id: buyerId,
        role: 'BUYER',
        deletedAt: null
      }
    });

    if (!buyer) {
      throw new ApiError(404, 'Buyer not found');
    }

    const updated = await prisma.user.update({
      where: { id: buyerId },
      data: {
        deletedAt: new Date()
      }
    });

    return updated;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    logger.error('Suspend buyer service error:', error);
    throw new ApiError(500, 'Failed to suspend buyer');
  }
};

/**
 * Activate buyer (restore)
 */
export const activateBuyerService = async (buyerId) => {
  try {
    const buyer = await prisma.user.findFirst({
      where: {
        id: buyerId,
        role: 'BUYER'
      }
    });

    if (!buyer) {
      throw new ApiError(404, 'Buyer not found');
    }

    const updated = await prisma.user.update({
      where: { id: buyerId },
      data: {
        deletedAt: null
      }
    });

    return updated;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    logger.error('Activate buyer service error:', error);
    throw new ApiError(500, 'Failed to activate buyer');
  }
};
