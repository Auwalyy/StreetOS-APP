import Joi from 'joi';

export const registerSchema = Joi.object({
  phone: Joi.string().pattern(/^\+?[1-9]\d{9,14}$/).required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().min(2).required(),
  lastName: Joi.string().min(2).required(),
  businessName: Joi.string().optional(),
  businessType: Joi.string().valid('trader', 'artisan', 'food_vendor', 'transport', 'other').optional(),
  language: Joi.string().valid('en', 'ha', 'yo', 'ig', 'pcm').default('en'),
  referralCode: Joi.string().optional(),
});

export const loginSchema = Joi.object({
  phone: Joi.string().required(),
  password: Joi.string().required(),
});

export const otpSchema = Joi.object({
  phone: Joi.string().required(),
  otp: Joi.string().length(6).required(),
});
