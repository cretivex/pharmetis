import Joi from 'joi';

export const createProductSchema = Joi.object({
  supplierId: Joi.string().uuid().optional(), // Optional - will be auto-set for vendors in controller
  name: Joi.string().max(255).required(),
  brand: Joi.string().max(255).optional(),
  strength: Joi.string().max(100).allow('', null),
  dosageForm: Joi.string().valid('TABLET', 'CAPSULE', 'INJECTABLE', 'SYRUP', 'SUSPENSION', 'CREAM', 'OINTMENT', 'DROPS', 'SPRAY', 'OTHER').required(),
  manufacturer: Joi.string().max(255).optional(),
  country: Joi.string().max(100).optional(),
  description: Joi.string().max(2000).optional().allow(''),
  apiName: Joi.string().max(255).optional(),
  composition: Joi.string().max(500).optional(),
  therapeutics: Joi.string().max(500).optional().allow(''),
  packagingType: Joi.string().max(100).optional(),
  shelfLife: Joi.string().max(100).optional(),
  storageConditions: Joi.string().max(500).optional().allow(''),
  regulatoryApprovals: Joi.string().max(1000).optional().allow(''),
  hsCode: Joi.string().max(50).optional(),
  moq: Joi.string().max(50).optional(),
  compareTo: Joi.string().max(255).allow('', null),
  ndcNumber: Joi.string().max(100).allow('', null),
  packSize: Joi.string().max(100).allow('', null),
  availability: Joi.string().valid('IN_STOCK', 'MADE_TO_ORDER', 'OUT_OF_STOCK').optional(),
  price: Joi.number().min(0).optional(),
  image_url: Joi.string().uri().allow('', null).optional(),
  images: Joi.array().items(Joi.object({
    url: Joi.string().uri().required(),
    alt: Joi.string().max(255).optional(),
    order: Joi.number().integer().min(0).optional()
  })).optional(),
  categoryIds: Joi.array().items(Joi.string().uuid()).optional()
});

export const updateProductSchema = Joi.object({
  name: Joi.string().max(255).optional(),
  brand: Joi.string().max(255).optional(),
  strength: Joi.string().max(100).allow('', null),
  dosageForm: Joi.string().valid('TABLET', 'CAPSULE', 'INJECTABLE', 'SYRUP', 'SUSPENSION', 'CREAM', 'OINTMENT', 'DROPS', 'SPRAY', 'OTHER').optional(),
  manufacturer: Joi.string().max(255).optional(),
  country: Joi.string().max(100).optional(),
  description: Joi.string().max(2000).optional().allow(''),
  apiName: Joi.string().max(255).optional(),
  composition: Joi.string().max(500).optional(),
  therapeutics: Joi.string().max(500).optional().allow(''),
  packagingType: Joi.string().max(100).optional(),
  shelfLife: Joi.string().max(100).optional(),
  storageConditions: Joi.string().max(500).optional().allow(''),
  regulatoryApprovals: Joi.string().max(1000).optional().allow(''),
  hsCode: Joi.string().max(50).optional(),
  moq: Joi.string().max(50).optional(),
  compareTo: Joi.string().max(255).allow('', null),
  ndcNumber: Joi.string().max(100).allow('', null),
  packSize: Joi.string().max(100).allow('', null),
  availability: Joi.string().valid('IN_STOCK', 'MADE_TO_ORDER', 'OUT_OF_STOCK').optional(),
  price: Joi.number().min(0).optional(),
  image_url: Joi.string().uri().allow('', null).optional(),
  images: Joi.array().items(Joi.object({
    url: Joi.string().uri().required(),
    alt: Joi.string().max(255).optional(),
    order: Joi.number().integer().min(0).optional()
  })).optional(),
  isActive: Joi.boolean().optional(),
  categoryIds: Joi.array().items(Joi.string().uuid()).optional()
});
