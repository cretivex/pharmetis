import Joi from 'joi';

export const createRFQSchema = Joi.object({
  title: Joi.string().min(3).max(200).optional(),
  notes: Joi.string().max(2000).optional().allow('', null),
  expiresAt: Joi.date().iso().greater('now').optional().allow(null).messages({
    'date.greater': 'Expiry date must be in the future'
  }),
  expectedDelivery: Joi.date().iso().greater('now').optional().allow(null).messages({
    'date.greater': 'Expected delivery date must be in the future'
  }),
  status: Joi.string().valid('DRAFT', 'SENT').optional(),
  items: Joi.array()
    .items(
      Joi.object({
        productId: Joi.string().uuid().optional().allow(null),
        productName: Joi.string().min(1).max(200).required(),
        quantity: Joi.string().min(1).max(50).required(),
        unit: Joi.string().max(20).optional().default('units'),
        notes: Joi.string().max(500).optional().allow('', null)
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one product item is required'
    })
});

export const sendRFQToSuppliersSchema = Joi.object({
  supplierIds: Joi.array().items(Joi.string().uuid()).optional().default([])
});

export const updateRFQSchema = Joi.object({
  title: Joi.string().min(3).max(200).optional(),
  notes: Joi.string().max(2000).optional().allow('', null),
  status: Joi.string().valid('DRAFT', 'SENT', 'RESPONDED', 'QUOTED', 'AWAITING_PAYMENT', 'IN_PROGRESS', 'SHIPPED', 'COMPLETED', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED').optional(),
  expiresAt: Joi.date().iso().optional().allow(null),
  expectedDelivery: Joi.date().iso().optional().allow(null)
});

export const processPaymentSchema = Joi.object({
  paymentType: Joi.string().valid('FULL', 'ADVANCE', 'PARTIAL', 'REMAINING').required(),
  amount: Joi.number().positive().optional().when('paymentType', {
    is: Joi.string().valid('ADVANCE', 'PARTIAL'),
    then: Joi.required(),
    otherwise: Joi.optional()
  })
});
