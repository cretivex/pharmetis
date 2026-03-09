import Joi from 'joi';

export const createPaymentSchema = Joi.object({
  rfqId: Joi.string().uuid().required().messages({
    'string.uuid': 'RFQ ID must be a valid UUID',
    'any.required': 'RFQ ID is required'
  }),
  paymentType: Joi.string().valid('FULL', 'ADVANCE').required().messages({
    'any.only': 'Payment type must be FULL or ADVANCE',
    'any.required': 'Payment type is required'
  }),
  amount: Joi.number().positive().optional().messages({
    'number.positive': 'Amount must be a positive number'
  })
});

export const confirmPaymentSchema = Joi.object({
  transactionId: Joi.string().optional(),
  gateway: Joi.string().optional(),
  gatewayResponse: Joi.object().optional()
});
