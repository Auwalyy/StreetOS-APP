"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordPaymentSchema = exports.createDebtSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.createDebtSchema = joi_1.default.object({
    customerName: joi_1.default.string().min(1).required(),
    customerId: joi_1.default.string().optional(),
    amount: joi_1.default.number().positive().required(),
    productName: joi_1.default.string().optional(),
    dueDate: joi_1.default.date().greater('now').required(),
    notes: joi_1.default.string().optional(),
    source: joi_1.default.string().valid('voice', 'manual', 'whatsapp').default('manual'),
});
exports.recordPaymentSchema = joi_1.default.object({
    amount: joi_1.default.number().positive().required(),
    method: joi_1.default.string().valid('cash', 'transfer', 'mobile_money').default('cash'),
    notes: joi_1.default.string().optional(),
});
//# sourceMappingURL=debt.validator.js.map