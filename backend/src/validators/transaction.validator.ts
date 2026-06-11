import Joi from 'joi';

export const createTransactionSchema = Joi.object({
  type: Joi.string().valid('sale', 'purchase', 'expense', 'income', 'transfer').required(),
  amount: Joi.number().positive().required(),
  quantity: Joi.number().min(0).optional(),
  unitPrice: Joi.number().min(0).optional(),
  productName: Joi.string().optional(),
  customerName: Joi.string().optional(),
  customerId: Joi.string().optional(),
  paymentMethod: Joi.string().valid('cash', 'transfer', 'credit', 'mobile_money').default('cash'),
  notes: Joi.string().optional(),
  source: Joi.string().valid('voice', 'manual', 'whatsapp', 'ussd').default('manual'),
  isOffline: Joi.boolean().default(false),
  location: Joi.object({
    lat: Joi.number(),
    lng: Joi.number(),
  }).optional(),
});

export const updateTransactionSchema = Joi.object({
  amount: Joi.number().positive().optional(),
  quantity: Joi.number().min(0).optional(),
  productName: Joi.string().optional(),
  notes: Joi.string().optional(),
  paymentMethod: Joi.string().valid('cash', 'transfer', 'credit', 'mobile_money').optional(),
});

export const syncTransactionsSchema = Joi.object({
  transactions: Joi.array().items(createTransactionSchema).min(1).required(),
});
