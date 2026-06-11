import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { authRateLimiter } from '../middleware/rateLimiter';
import { authenticate } from '../middleware/auth';
import Joi from 'joi';

const router = Router();

const registerSchema = Joi.object({
  phone: Joi.string().pattern(/^\+?[1-9]\d{9,14}$/).required(),
  password: Joi.string().min(8).required(),
  firstName: Joi.string().min(2).required(),
  lastName: Joi.string().min(2).required(),
  businessName: Joi.string().optional(),
  businessType: Joi.string().valid('trader', 'artisan', 'food_vendor', 'transport', 'other').optional(),
  language: Joi.string().valid('en', 'ha', 'yo', 'ig', 'pcm').optional(),
});

const loginSchema = Joi.object({
  phone: Joi.string().required(),
  password: Joi.string().required(),
});

router.post('/register', authRateLimiter, validate(registerSchema), authController.register);
router.post('/login', authRateLimiter, validate(loginSchema), authController.login);
router.post('/verify-otp', validate(Joi.object({ phone: Joi.string().required(), otp: Joi.string().length(6).required() })), authController.verifyOTP);
router.post('/resend-otp', authRateLimiter, validate(Joi.object({ phone: Joi.string().required() })), authController.resendOTP);
router.post('/refresh-token', validate(Joi.object({ refreshToken: Joi.string().required() })), authController.refreshToken);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.getMe);
router.put('/fcm-token', authenticate, authController.updateFCMToken);
router.put('/fcm-token', authenticate, authController.updateFCMToken);

export default router;
