import Joi from 'joi';

export const updateRFQResponseSchema = Joi.object({
  totalAmount: Joi.number().positive().optional(),
  currency: Joi.string().max(10).optional(),
  validity: Joi.date().iso().optional().allow(null),
  notes: Joi.string().max(2000).optional().allow('', null),
  adminNotes: Joi.string().max(2000).optional().allow('', null),
  items: Joi.array().items(
    Joi.object({
      id: Joi.string().uuid().required(),
      editedUnitPrice: Joi.number().min(0).optional(),
      margin: Joi.number().optional(),
      unitPrice: Joi.number().min(0).optional(),
      totalPrice: Joi.number().min(0).optional()
    })
  ).optional()
});

export const negotiationResponseSchema = Joi.object({
  action: Joi.string().valid('ACCEPT', 'COUNTER', 'REJECT').required(),
  counterPrice: Joi.number().positive().when('action', {
    is: 'COUNTER',
    then: Joi.required(),
    otherwise: Joi.optional()
  })
});
