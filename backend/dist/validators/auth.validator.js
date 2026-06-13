"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.otpSchema = exports.loginSchema = exports.registerSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.registerSchema = joi_1.default.object({
    phone: joi_1.default.string().pattern(/^\+?[1-9]\d{9,14}$/).required(),
    password: joi_1.default.string().min(8).required(),
    firstName: joi_1.default.string().min(2).required(),
    lastName: joi_1.default.string().min(2).required(),
    businessName: joi_1.default.string().optional(),
    businessType: joi_1.default.string().valid('trader', 'artisan', 'food_vendor', 'transport', 'other').optional(),
    language: joi_1.default.string().valid('en', 'ha', 'yo', 'ig', 'pcm').default('en'),
    referralCode: joi_1.default.string().optional(),
});
exports.loginSchema = joi_1.default.object({
    phone: joi_1.default.string().required(),
    password: joi_1.default.string().required(),
});
exports.otpSchema = joi_1.default.object({
    phone: joi_1.default.string().required(),
    otp: joi_1.default.string().length(6).required(),
});
//# sourceMappingURL=auth.validator.js.map