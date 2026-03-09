import Joi from 'joi';

export const createBuyerRFQSchema = Joi.object({
  title: Joi.string().min(3).max(200).optional(),
  notes: Joi.string().max(2000).optional().allow('', null),
  expiresAt: Joi.date().iso().greater('now').optional().allow(null).messages({
    'date.greater': 'Expiry date must be in the future'
  }),
  expectedDelivery: Joi.date().iso().greater('now').optional().allow(null).messages({
    'date.greater': 'Expected delivery date must be in the future'
  }),
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

export const requestLowerPriceSchema = Joi.object({
  requestedPrice: Joi.number().positive().required().messages({
    'number.positive': 'Requested price must be a positive number',
    'any.required': 'Requested price is required'
  }),
  message: Joi.string().max(1000).optional().allow('', null)
});
