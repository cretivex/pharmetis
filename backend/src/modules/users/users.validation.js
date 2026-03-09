import Joi from 'joi';

export const updateProfileSchema = Joi.object({
  email: Joi.string().email().optional(),
  fullName: Joi.string().min(2).max(100).optional(),
  companyName: Joi.string().min(2).max(200).optional(),
  phone: Joi.string().max(20).optional(),
  country: Joi.string().max(100).optional(),
  city: Joi.string().max(100).optional(),
  avatar: Joi.string().uri().allow('', null).optional()
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).max(100).required()
});

/** Set password without current (e.g. after OTP-only signup). Authenticated user only. */
export const setPasswordSchema = Joi.object({
  newPassword: Joi.string().min(8).max(100).required().messages({
    'string.min': 'Password must be at least 8 characters',
    'any.required': 'New password is required'
  })
});

export const updateSettingsSchema = Joi.object({
  language: Joi.string().max(10).optional(),
  currency: Joi.string().max(10).optional(),
  timezone: Joi.string().max(100).optional(),
  notifications: Joi.object().optional(),
  preferences: Joi.object().optional()
});

export const companyInfoSchema = Joi.object({
  companyName: Joi.string().allow('', null).optional(),
  gstTaxId: Joi.string().allow('', null).optional(),
  drugLicenseNo: Joi.string().allow('', null).optional(),
  businessType: Joi.string().valid('Wholesaler', 'Retailer', 'Manufacturer', 'Distributor', 'Hospital', 'Clinic', 'Pharmacy', 'Other').allow('', null).optional(),
  website: Joi.string().uri().allow('', null).optional(),
  documents: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    url: Joi.string().uri().required(),
    type: Joi.string().optional()
  })).optional()
});

export const addressSchema = Joi.object({
  label: Joi.string().allow('', null).optional(),
  fullName: Joi.string().required().messages({
    'any.required': 'Full name is required'
  }),
  companyName: Joi.string().allow('', null).optional(),
  phone: Joi.string().required().messages({
    'any.required': 'Phone number is required'
  }),
  email: Joi.string().email().allow('', null).optional(),
  addressLine1: Joi.string().required().messages({
    'any.required': 'Address line 1 is required'
  }),
  addressLine2: Joi.string().allow('', null).optional(),
  city: Joi.string().required().messages({
    'any.required': 'City is required'
  }),
  state: Joi.string().required().messages({
    'any.required': 'State is required'
  }),
  postalCode: Joi.string().required().messages({
    'any.required': 'Postal code is required'
  }),
  country: Joi.string().required().messages({
    'any.required': 'Country is required'
  }),
  isDefault: Joi.boolean().optional()
});

export const updateAddressSchema = Joi.object({
  label: Joi.string().allow('', null).optional(),
  fullName: Joi.string().optional(),
  companyName: Joi.string().allow('', null).optional(),
  phone: Joi.string().optional(),
  email: Joi.string().email().allow('', null).optional(),
  addressLine1: Joi.string().optional(),
  addressLine2: Joi.string().allow('', null).optional(),
  city: Joi.string().optional(),
  state: Joi.string().optional(),
  postalCode: Joi.string().optional(),
  country: Joi.string().optional(),
  isDefault: Joi.boolean().optional()
});

export const otpPreferenceSchema = Joi.object({
  enabled: Joi.boolean().required().messages({
    'any.required': 'Enabled status is required'
  })
});
