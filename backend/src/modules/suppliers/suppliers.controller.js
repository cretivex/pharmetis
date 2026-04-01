import { 
  getSuppliersService, 
  getSupplierBySlugService, 
  getSupplierByIdService, 
  getSupplierProductsService,
  createSupplierService,
  updateSupplierService,
  deleteSupplierService,
  getSupplierMeService
} from './suppliers.service.js';
import { 
  createSupplierWithOTPService,
  verifySupplierOTPService,
  resendSupplierOTPService
} from './supplier-otp.service.js';
import { sendResetOtpSupplierService, resetPasswordWithOtpSupplierService } from './supplier-auth.service.js';
import { logger } from '../../utils/logger.js';
import { ApiError } from '../../utils/ApiError.js';

export const getSuppliers = async (req, res, next) => {
  try {
    const result = await getSuppliersService(req.query);
    res.status(200).json({
      success: true,
      message: 'Suppliers retrieved successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getSupplierBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const result = await getSupplierBySlugService(slug);
    res.status(200).json({
      success: true,
      message: 'Supplier retrieved successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getSupplierById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (id === 'me') {
      logger.warn('[getSupplierById] /me was matched as /:id. Route order may be incorrect.');
      return res.status(404).json({
        success: false,
        message: 'Route not found. Use /suppliers/me for your profile.',
        data: null
      });
    }
    
    const result = await getSupplierByIdService(id);
    res.status(200).json({
      success: true,
      message: 'Supplier retrieved successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getSupplierProducts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await getSupplierProductsService(id, req.query);
    res.status(200).json({
      success: true,
      message: 'Supplier products retrieved successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const createSupplier = async (req, res, next) => {
  try {
    // 1. Validate input (already validated by middleware, but double-check)
    const {
      email,
      password,
      companyName,
      country,
      city,
      address,
      phone,
      website,
      description,
      therapeutics,
      manufacturer,
      yearsInBusiness,
      contactEmail,
      contactPhone,
      contactName,
      contactDesignation,
      gstNumber,
      licenseNumber,
      licenseType,
      licenseExpiry,
      postalCode
    } = req.body;

    if (!email || !password || !companyName || !country) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, password, companyName, and country are required'
      });
    }

    // 2. Create supplier with OTP (service handles duplicate check, OTP generation, email sending)
    const result = await createSupplierWithOTPService({
      email,
      password,
      companyName,
      country,
      city,
      address,
      phone,
      website,
      description,
      therapeutics,
      manufacturer,
      yearsInBusiness,
      contactEmail,
      contactPhone,
      contactName,
      contactDesignation,
      gstNumber,
      licenseNumber,
      licenseType,
      licenseExpiry,
      postalCode
    });

    // 3. Return success (OTP sent to email)
    return res.status(201).json({
      success: true,
      message: 'Registration successful. OTP sent to your email for verification.',
      data: {
        email: result.user.email,
        companyName: result.supplier.companyName
      }
    });
  } catch (error) {
    logger.error('Create supplier controller error:', error);
    
    // Handle duplicate email error
    if (error instanceof ApiError && error.statusCode === 409) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    
    // Pass to error handler middleware
    next(error);
  }
};

// Verify OTP endpoint
export const verifySupplierOTP = async (req, res, next) => {
  try {
    const { email, otpCode } = req.body;

    if (!email || !otpCode) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP code are required'
      });
    }

    // Verify OTP
    const result = await verifySupplierOTPService(email, otpCode);

    return res.status(200).json({
      success: true,
      message: 'Account verified successfully. You can now login.',
      data: {
        supplier: result.supplier,
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken
      }
    });
  } catch (error) {
    logger.error('Verify supplier OTP controller error:', error);
    
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
    
    next(error);
  }
};

// Send reset OTP (supplier forgot password)
export const sendResetOtpSupplier = async (req, res, next) => {
  try {
    const { email } = req.body;
    logger.info('Send reset OTP requested for email:', email || '(empty)');
    const result = await sendResetOtpSupplierService(email);
    res.status(200).json({
      success: true,
      message: result.message,
      data: result.expiresAt ? { expiresAt: result.expiresAt } : null
    });
  } catch (error) {
    logger.error('Send reset OTP error:', error?.message || error);
    logger.error('Send reset OTP supplier error:', error);
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

// Reset password with OTP (supplier)
export const resetPasswordSupplier = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    const result = await resetPasswordWithOtpSupplierService(email, otp, newPassword);
    res.status(200).json({
      success: true,
      message: result.message,
      data: null
    });
  } catch (error) {
    logger.error('Reset password supplier error:', error);
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
    next(error);
  }
};

// Resend OTP endpoint
export const resendSupplierOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const result = await resendSupplierOTPService(email);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: {
        expiresAt: result.expiresAt
      }
    });
  } catch (error) {
    logger.error('Resend supplier OTP controller error:', error);
    
    if (error instanceof ApiError) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message
      });
    }
    
    next(error);
  }
};

export const updateSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await updateSupplierService(id, req.body);
    const user = req.user;

    if (user && (req.body.isVerified !== undefined || req.body.isActive !== undefined)) {
      const { logAdminAction } = await import('../../utils/auditLogger.js');
      const action = req.body.isVerified === true ? 'SUPPLIER_APPROVE' : req.body.isVerified === false ? 'SUPPLIER_REJECT' : req.body.isActive ? 'SUPPLIER_ACTIVATE' : 'SUPPLIER_DEACTIVATE';
      await logAdminAction({
        user: { id: user.id, email: user.email, role: user.role },
        action,
        resourceType: 'Supplier',
        resourceId: id,
        newValue: result ? { companyName: result.companyName, isVerified: result.isVerified, isActive: result.isActive } : undefined,
        req,
      });
    }

    let message = 'Supplier updated successfully';
    if (req.body.isVerified !== undefined) {
      message = req.body.isVerified ? 'Supplier approved successfully' : 'Supplier rejected successfully';
    } else if (req.body.isActive !== undefined) {
      message = req.body.isActive ? 'Supplier activated successfully' : 'Supplier deactivated successfully';
    }

    res.status(200).json({
      success: true,
      message,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSupplier = async (req, res, next) => {
  try {
    const { id } = req.params;
    await deleteSupplierService(id);
    const user = req.user;
    if (user) {
      const { logAdminAction } = await import('../../utils/auditLogger.js');
      await logAdminAction({
        user: { id: user.id, email: user.email, role: user.role },
        action: 'SUPPLIER_DELETE',
        resourceType: 'Supplier',
        resourceId: id,
        req,
      });
    }
    res.status(200).json({
      success: true,
      message: 'Supplier deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getSupplierMe = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        data: null
      });
    }

    // Get or create supplier profile
    let supplier = await getSupplierMeService(req.user.id);
    
    // Auto-create supplier if missing
    if (!supplier) {
      supplier = await createSupplierService({
        userId: req.user.id,
        companyName: req.user.companyName || req.user.email?.split('@')[0] || '',
        country: req.user.country || '',
        city: req.user.city || null,
        address: null,
        phone: req.user.phone || '',
        website: null,
        description: null,
        yearsInBusiness: null,
        logo: null
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Supplier retrieved successfully',
      data: supplier
    });
  } catch (error) {
    logger.error('[getSupplierMe] Error:', error);
    next(error);
  }
};

export const updateSupplierMe = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        data: null
      });
    }

    // Get supplier ID from user
    let supplier = await getSupplierMeService(req.user.id);
    
    // Auto-create supplier if missing
    if (!supplier) {
      supplier = await createSupplierService({
        userId: req.user.id,
        companyName: req.body.companyName || '',
        country: req.body.country || '',
        city: req.body.city || null,
        address: req.body.address || null,
        phone: req.body.phone || null,
        website: req.body.website || null,
        description: req.body.description || null,
        yearsInBusiness: req.body.yearsInBusiness || null,
        logo: req.body.logo || null
      });
    }

    const result = await updateSupplierService(supplier.id, req.body);
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};
