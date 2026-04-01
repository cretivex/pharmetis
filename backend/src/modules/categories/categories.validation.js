import Joi from 'joi';

export const createCategorySchema = Joi.object({
  name: Joi.string().max(255).required(),
  slug: Joi.string().max(255).optional(),
  description: Joi.string().allow('', null).optional(),
  parentId: Joi.string().uuid().allow(null).optional(),
  order: Joi.number().integer().min(0).optional(),
  isActive: Joi.boolean().optional(),
  category_image: Joi.string().uri().allow('', null).optional(),
  subcategory_image: Joi.string().uri().allow('', null).optional()
});

export const updateCategorySchema = Joi.object({
  name: Joi.string().max(255).optional(),
  slug: Joi.string().max(255).optional(),
  description: Joi.string().allow('', null).optional(),
  parentId: Joi.string().uuid().allow(null).optional(),
  order: Joi.number().integer().min(0).optional(),
  isActive: Joi.boolean().optional(),
  category_image: Joi.string().uri().allow('', null).optional(),
  subcategory_image: Joi.string().uri().allow('', null).optional()
});
