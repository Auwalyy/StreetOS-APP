import Joi from 'joi';

export const createDebtSchema = Joi.object({
  customerName: Joi.string().min(1).required(),
  customerId: Joi.string().optional(),
  amount: Joi.number().positive().required(),
  productName: Joi.string().optional(),
  dueDate: Joi.date().greater('now').required(),
  notes: Joi.string().optional(),
  source: Joi.string().valid('voice', 'manual', 'whatsapp').default('manual'),
});

export const recordPaymentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  method: Joi.string().valid('cash', 'transfer', 'mobile_money').default('cash'),
  notes: Joi.string().optional(),
});
