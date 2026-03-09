import { getAllBuyersService, getBuyerByIdService, getBuyerRFQsService, getBuyerPaymentsService, suspendBuyerService, activateBuyerService } from './buyers.service.js';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';

/**
 * Get all buyers (Admin only)
 */
export const getAllBuyers = async (req, res, next) => {
  try {
    // Safe pagination parsing
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    
    // Validate pagination values
    if (isNaN(page) || page < 1) {
      throw new ApiError(400, 'Invalid page number');
    }
    if (isNaN(limit) || limit < 1 || limit > 100) {
      throw new ApiError(400, 'Invalid limit (must be between 1 and 100)');
    }

    const query = {
      page: page,
      limit: limit,
      search: req.query.search || '',
      status: req.query.status || 'all',
      sortBy: req.query.sortBy || 'createdAt',
      sortOrder: req.query.sortOrder || 'desc'
    };

    logger.debug('Get all buyers - Query:', query);

    const result = await getAllBuyersService(query);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Get All Buyers Controller Error:', error);
    logger.error('Stack:', error.stack);
    logger.error('Get all buyers controller error:', error);
    
    if (error instanceof ApiError) {
      return next(error);
    }
    
    next(error);
  }
};

/**
 * Get buyer by ID (Admin only)
 */
export const getBuyerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new ApiError(400, 'Buyer ID is required');
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new ApiError(400, 'Invalid buyer ID format');
    }

    logger.debug('Get buyer by ID - ID:', id);

    const buyer = await getBuyerByIdService(id);

    res.status(200).json({
      success: true,
      data: buyer
    });
  } catch (error) {
    logger.error('Get Buyer By ID Controller Error:', error);
    logger.error('Stack:', error.stack);
    logger.error('Get buyer by ID controller error:', error);
    
    if (error instanceof ApiError) {
      return next(error);
    }
    
    next(error);
  }
};

/**
 * Get buyer RFQs (Admin only)
 */
export const getBuyerRFQs = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      throw new ApiError(400, 'Buyer ID is required');
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new ApiError(400, 'Invalid buyer ID format');
    }

    // Safe pagination parsing
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    
    if (isNaN(page) || page < 1) {
      throw new ApiError(400, 'Invalid page number');
    }
    if (isNaN(limit) || limit < 1 || limit > 100) {
      throw new ApiError(400, 'Invalid limit (must be between 1 and 100)');
    }

    const query = {
      page: page,
      limit: limit,
      status: req.query.status || 'all'
    };

    logger.debug('Get buyer RFQs - ID:', id, 'Query:', query);

    const result = await getBuyerRFQsService(id, query);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Get Buyer RFQs Controller Error:', error);
    logger.error('Stack:', error.stack);
    logger.error('Get buyer RFQs controller error:', error);
    
    if (error instanceof ApiError) {
      return next(error);
    }
    
    next(error);
  }
};

/**
 * Get buyer payments (Admin only)
 */
export const getBuyerPayments = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      throw new ApiError(400, 'Buyer ID is required');
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new ApiError(400, 'Invalid buyer ID format');
    }

    // Safe pagination parsing
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    
    if (isNaN(page) || page < 1) {
      throw new ApiError(400, 'Invalid page number');
    }
    if (isNaN(limit) || limit < 1 || limit > 100) {
      throw new ApiError(400, 'Invalid limit (must be between 1 and 100)');
    }

    const query = {
      page: page,
      limit: limit,
      status: req.query.status || 'all'
    };

    logger.debug('Get buyer payments - ID:', id, 'Query:', query);

    const result = await getBuyerPaymentsService(id, query);

    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    logger.error('Get Buyer Payments Controller Error:', error);
    logger.error('Stack:', error.stack);
    logger.error('Get buyer payments controller error:', error);
    
    if (error instanceof ApiError) {
      return next(error);
    }
    
    next(error);
  }
};

/**
 * Suspend buyer (Admin only)
 */
export const suspendBuyer = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new ApiError(400, 'Buyer ID is required');
    }

    const buyer = await suspendBuyerService(id);

    res.status(200).json({
      success: true,
      message: 'Buyer suspended successfully',
      data: buyer
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    logger.error('Suspend buyer controller error:', error);
    next(error);
  }
};

/**
 * Activate buyer (Admin only)
 */
export const activateBuyer = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      throw new ApiError(400, 'Buyer ID is required');
    }

    const buyer = await activateBuyerService(id);

    res.status(200).json({
      success: true,
      message: 'Buyer activated successfully',
      data: buyer
    });
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    logger.error('Activate buyer controller error:', error);
    next(error);
  }
};
