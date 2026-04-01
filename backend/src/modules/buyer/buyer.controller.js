import { 
  createBuyerRFQService,
  getBuyerRFQsService,
  getBuyerRFQByIdService,
  acceptBuyerQuotationService,
  rejectBuyerQuotationService,
  requestLowerPriceService
} from './buyer.service.js';
import { updateCompanyInfoService } from '../users/company.service.js';
import { ApiError } from '../../utils/ApiError.js';
import { logger } from '../../utils/logger.js';

export const createBuyerRFQ = async (req, res, next) => {
  try {
    // Log user info for debugging
    logger.debug('Create RFQ request - User:', {
      id: req.user?.id,
      email: req.user?.email,
      role: req.user?.role
    });

    if (!req.user) {
      logger.warn('Create RFQ: No user in request');
      throw new ApiError(401, 'Authentication required');
    }

    // Allow BUYER and ADMIN roles to create RFQs
    if (!['BUYER', 'ADMIN'].includes(req.user.role)) {
      logger.warn(`Create RFQ: User ${req.user.id} (${req.user.email}) has role ${req.user.role}, but BUYER or ADMIN role is required`);
      throw new ApiError(403, `Only buyers and admins can create RFQs. Your current role is: ${req.user.role}`);
    }

    const result = await createBuyerRFQService(req.user.id, req.body);
    
    res.status(201).json({
      success: true,
      message: 'RFQ created successfully',
      data: result
    });
  } catch (error) {
    logger.error('Create buyer RFQ error:', error);
    next(error);
  }
};

export const getBuyerRFQs = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Allow BUYER and ADMIN roles
    if (!['BUYER', 'ADMIN'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only buyers and admins can access this endpoint'
      });
    }

    // Clean query parameters - remove undefined/null string values
    const cleanQuery = { ...req.query };
    if (cleanQuery.status === 'undefined' || cleanQuery.status === 'null' || cleanQuery.status === '') {
      delete cleanQuery.status;
    }

    const rfqs = await getBuyerRFQsService(req.user.id, cleanQuery);
    
    return res.status(200).json({
      success: true,
      data: Array.isArray(rfqs) ? rfqs : []
    });
  } catch (error) {
    logger.error('Get buyer RFQs error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch RFQs'
    });
  }
};

export const getBuyerRFQById = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Allow BUYER and ADMIN roles
    if (!['BUYER', 'ADMIN'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only buyers and admins can access this endpoint'
      });
    }

    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'RFQ ID is required'
      });
    }

    const rfq = await getBuyerRFQByIdService(id, req.user.id);
    
    if (!rfq) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: rfq
    });
  } catch (error) {
    logger.error('Get buyer RFQ by ID error:', error);
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found'
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch RFQ details'
    });
  }
};

export const acceptBuyerQuotation = async (req, res, next) => {
  try {
    // Allow BUYER and ADMIN roles
    if (!req.user || !['BUYER', 'ADMIN'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only buyers and admins can accept quotations'
      });
    }

    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Quotation ID is required'
      });
    }

    const result = await acceptBuyerQuotationService(id, req.user.id);
    
    return res.status(200).json({
      success: true,
      message: 'Quotation accepted',
      data: {
        quotationId: id
      }
    });
  } catch (error) {
    logger.error('Accept buyer quotation error:', error);
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found'
      });
    }
    if (error.statusCode === 400) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to accept quotation'
    });
  }
};

export const rejectBuyerQuotation = async (req, res, next) => {
  try {
    // Allow BUYER and ADMIN roles
    if (!req.user || !['BUYER', 'ADMIN'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only buyers and admins can reject quotations'
      });
    }

    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Quotation ID is required'
      });
    }

    await rejectBuyerQuotationService(id, req.user.id);
    
    return res.status(200).json({
      success: true,
      message: 'Quotation rejected successfully'
    });
  } catch (error) {
    logger.error('Reject buyer quotation error:', error);
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found'
      });
    }
    if (error.statusCode === 400) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Failed to reject quotation'
    });
  }
};

export const requestLowerPrice = async (req, res, next) => {
  try {
    // Allow BUYER and ADMIN roles
    if (!req.user || !['BUYER', 'ADMIN'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only buyers and admins can request lower prices'
      });
    }

    const { id } = req.params;
    const { requestedPrice, message } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Quotation ID is required'
      });
    }

    if (!requestedPrice || requestedPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid requested price is required'
      });
    }

    await requestLowerPriceService(id, req.user.id, {
      requestedPrice: parseFloat(requestedPrice),
      message: message || null
    });
    
    return res.status(200).json({
      success: true,
      message: 'Price negotiation request submitted successfully'
    });
  } catch (error) {
    logger.error('Request lower price error:', error);
    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found'
      });
    }
    if (error.statusCode === 400) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    const message = process.env.NODE_ENV !== 'production' && error?.message
      ? error.message
      : 'Failed to submit price negotiation request';
    return res.status(500).json({
      success: false,
      message
    });
  }
};

/**
 * PUT /buyer/company - Update company info (FormData from frontend)
 * Maps: gstNumber -> gstTaxId, drugLicenseNumber -> drugLicenseNo
 */
export const updateBuyerCompany = async (req, res, next) => {
  try {
    if (!req.user || !['BUYER', 'ADMIN'].includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Only buyers and admins can update company info'
      });
    }
    const body = req.body || {};
    const data = {
      companyName: body.companyName !== undefined ? body.companyName : undefined,
      gstTaxId: body.gstNumber !== undefined ? body.gstNumber : body.gstTaxId,
      drugLicenseNo: body.drugLicenseNumber !== undefined ? body.drugLicenseNumber : body.drugLicenseNo,
      businessType: body.businessType !== undefined ? body.businessType : undefined,
      website: body.website !== undefined ? body.website : undefined,
      document_url: body.document_url !== undefined ? body.document_url : undefined
    };
    const result = await updateCompanyInfoService(req.user.id, data);
    return res.status(200).json({
      success: true,
      message: 'Company information updated successfully',
      data: result
    });
  } catch (error) {
    logger.error('Update buyer company error:', error);
    next(error);
  }
};
