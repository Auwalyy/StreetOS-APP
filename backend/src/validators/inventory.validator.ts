import Joi from 'joi';

export const createInventorySchema = Joi.object({
  name: Joi.string().min(1).required(),
  category: Joi.string().optional(),
  sku: Joi.string().optional(),
  quantity: Joi.number().min(0).required(),
  unit: Joi.string().default('pieces'),
  costPrice: Joi.number().min(0).default(0),
  sellingPrice: Joi.number().min(0).default(0),
  lowStockThreshold: Joi.number().min(0).default(5),
  supplier: Joi.string().optional(),
  reorderPoint: Joi.number().optional(),
  images: Joi.array().items(Joi.string()).optional(),
});

export const updateInventorySchema = Joi.object({
  name: Joi.string().optional(),
  category: Joi.string().optional(),
  quantity: Joi.number().min(0).optional(),
  unit: Joi.string().optional(),
  costPrice: Joi.number().min(0).optional(),
  sellingPrice: Joi.number().min(0).optional(),
  lowStockThreshold: Joi.number().min(0).optional(),
  supplier: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
});
