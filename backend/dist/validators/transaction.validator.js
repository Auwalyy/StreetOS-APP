"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncTransactionsSchema = exports.updateTransactionSchema = exports.createTransactionSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createTransactionSchema = joi_1.default.object({
    type: joi_1.default.string().valid('sale', 'purchase', 'expense', 'income', 'transfer').required(),
    amount: joi_1.default.number().positive().required(),
    quantity: joi_1.default.number().min(0).optional(),
    unitPrice: joi_1.default.number().min(0).optional(),
    productName: joi_1.default.string().optional(),
    customerName: joi_1.default.string().optional(),
    customerId: joi_1.default.string().optional(),
    paymentMethod: joi_1.default.string().valid('cash', 'transfer', 'credit', 'mobile_money').default('cash'),
    notes: joi_1.default.string().optional(),
    source: joi_1.default.string().valid('voice', 'manual', 'whatsapp', 'ussd').default('manual'),
    isOffline: joi_1.default.boolean().default(false),
    location: joi_1.default.object({
        lat: joi_1.default.number(),
        lng: joi_1.default.number(),
    }).optional(),
});
exports.updateTransactionSchema = joi_1.default.object({
    amount: joi_1.default.number().positive().optional(),
    quantity: joi_1.default.number().min(0).optional(),
    productName: joi_1.default.string().optional(),
    notes: joi_1.default.string().optional(),
    paymentMethod: joi_1.default.string().valid('cash', 'transfer', 'credit', 'mobile_money').optional(),
});
exports.syncTransactionsSchema = joi_1.default.object({
    transactions: joi_1.default.array().items(exports.createTransactionSchema).min(1).required(),
});
//# sourceMappingURL=transaction.validator.js.map