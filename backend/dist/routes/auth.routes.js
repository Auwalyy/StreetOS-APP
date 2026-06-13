"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController = __importStar(require("../controllers/auth.controller"));
const validate_1 = require("../middleware/validate");
const rateLimiter_1 = require("../middleware/rateLimiter");
const auth_1 = require("../middleware/auth");
const joi_1 = __importDefault(require("joi"));
const router = (0, express_1.Router)();
const registerSchema = joi_1.default.object({
    phone: joi_1.default.string().pattern(/^\+?[1-9]\d{9,14}$/).required(),
    password: joi_1.default.string().min(8).required(),
    firstName: joi_1.default.string().min(2).required(),
    lastName: joi_1.default.string().min(2).required(),
    businessName: joi_1.default.string().optional(),
    businessType: joi_1.default.string().valid('trader', 'artisan', 'food_vendor', 'transport', 'other').optional(),
    language: joi_1.default.string().valid('en', 'ha', 'yo', 'ig', 'pcm').optional(),
});
const loginSchema = joi_1.default.object({
    phone: joi_1.default.string().required(),
    password: joi_1.default.string().required(),
});
router.post('/register', rateLimiter_1.authRateLimiter, (0, validate_1.validate)(registerSchema), authController.register);
router.post('/login', rateLimiter_1.authRateLimiter, (0, validate_1.validate)(loginSchema), authController.login);
router.post('/verify-otp', (0, validate_1.validate)(joi_1.default.object({ phone: joi_1.default.string().required(), otp: joi_1.default.string().length(6).required() })), authController.verifyOTP);
router.post('/resend-otp', rateLimiter_1.authRateLimiter, (0, validate_1.validate)(joi_1.default.object({ phone: joi_1.default.string().required() })), authController.resendOTP);
router.post('/refresh-token', (0, validate_1.validate)(joi_1.default.object({ refreshToken: joi_1.default.string().required() })), authController.refreshToken);
router.post('/logout', authController.logout);
router.get('/me', auth_1.authenticate, authController.getMe);
router.put('/fcm-token', auth_1.authenticate, authController.updateFCMToken);
router.put('/fcm-token', auth_1.authenticate, authController.updateFCMToken);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map