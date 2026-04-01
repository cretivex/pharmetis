import Joi from 'joi';

export const paginationQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().max(64).optional(),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
  search: Joi.string().max(255).allow('').optional()
}).unknown(true);
