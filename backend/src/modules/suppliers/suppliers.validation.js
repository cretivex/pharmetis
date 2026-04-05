import Joi from 'joi';

const certificationItemSchema = Joi.object({
  type: Joi.string().max(255).required(),
  number: Joi.string().max(255).allow('', null).optional(),
  issuedBy: Joi.string().max(500).allow('', null).optional(),
  issuedDate: Joi.date().allow(null).optional(),
  expiryDate: Joi.date().allow(null).optional(),
  document: Joi.string().uri().allow('', null).optional()
});

export const updateSupplierSchema = Joi.object({
  companyName: Joi.string().max(255).optional(),
  country: Joi.string().max(100).optional(),
  city: Joi.string().max(100).optional(),
  address: Joi.string().max(500).optional(),
  phone: Joi.string().max(50).optional(),
  email: Joi.string().email().optional(),
  website: Joi.string().allow('', null).optional().custom((value, helpers) => {
    // Allow empty or null values
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return value;
    }
    
    const trimmed = String(value).trim();
    
    // If it doesn't start with http:// or https://, auto-add https://
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return `https://${trimmed}`;
    }
    
    return trimmed;
  }, 'Website URL normalization'),
  description: Joi.string().max(2000).optional().allow(''),
  therapeutics: Joi.string().max(500).optional().allow(''),
  manufacturer: Joi.string().max(255).optional().allow(''),
  yearsInBusiness: Joi.number().integer().min(0).max(200).optional(),
  logo: Joi.string().uri().allow('').optional(),
  logo_url: Joi.string().uri().allow('').optional(),
  isVerified: Joi.boolean().optional(),
  isActive: Joi.boolean().optional(),
  certifications: Joi.array().items(certificationItemSchema).optional()
});

/** Vendor self-service: cannot toggle admin approval flags. */
export const updateSupplierMeSchema = updateSupplierSchema.keys({
  isVerified: Joi.forbidden(),
  isActive: Joi.forbidden()
});

export const createSupplierSchema = Joi.object({
  // User registration fields
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  // Supplier fields
  companyName: Joi.string().max(255).required(),
  country: Joi.string().max(100).required(),
  city: Joi.string().max(100).optional(),
  address: Joi.string().max(500).optional(),
  phone: Joi.string().max(50).optional(),
  contactEmail: Joi.string().email().optional(),
  contactPhone: Joi.string().max(50).optional(),
  contactName: Joi.string().max(255).optional(),
  contactDesignation: Joi.string().max(255).optional(),
  website: Joi.string().allow('', null).optional().custom((value, helpers) => {
    // Allow empty or null values
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      return value;
    }
    
    const trimmed = String(value).trim();
    
    // If it doesn't start with http:// or https://, auto-add https://
    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return `https://${trimmed}`;
    }
    
    return trimmed;
  }, 'Website URL normalization'),
  description: Joi.string().max(2000).optional().allow(''),
  therapeutics: Joi.string().max(500).optional().allow(''),
  manufacturer: Joi.string().max(255).optional().allow(''),
  yearsInBusiness: Joi.number().integer().min(0).max(200).optional(),
  gstNumber: Joi.string().max(50).optional(),
  licenseNumber: Joi.string().max(100).optional(),
  licenseType: Joi.string().max(100).optional(),
  licenseExpiry: Joi.date().allow(null, '').optional(),
  postalCode: Joi.string().max(20).optional(),
  logo: Joi.string().uri().allow('').optional()
  ,
  logo_url: Joi.string().uri().allow('').optional()
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required()
});

export const sendResetOtpSchema = Joi.object({
  email: Joi.string().email().required()
});

export const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).pattern(/^\d+$/).required(),
  newPassword: Joi.string().min(8).required(),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
});
