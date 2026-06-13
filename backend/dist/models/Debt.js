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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const DebtSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    customerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Customer', required: true },
    customerName: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    amountPaid: { type: Number, default: 0, min: 0 },
    balance: { type: Number, required: true, min: 0 },
    dueDate: { type: Date, required: true },
    status: {
        type: String,
        enum: ['pending', 'partial', 'settled', 'overdue', 'disputed'],
        default: 'pending',
    },
    productName: String,
    notes: String,
    reminders: [
        {
            sentAt: Date,
            channel: { type: String, enum: ['whatsapp', 'sms', 'push'] },
            status: { type: String, enum: ['sent', 'delivered', 'failed'] },
        },
    ],
    payments: [
        {
            amount: { type: Number, required: true },
            paidAt: { type: Date, default: Date.now },
            method: String,
            notes: String,
        },
    ],
    source: { type: String, enum: ['voice', 'manual', 'whatsapp'], default: 'manual' },
}, { timestamps: true });
DebtSchema.index({ userId: 1, status: 1 });
DebtSchema.index({ dueDate: 1, status: 1 });
DebtSchema.index({ userId: 1, customerId: 1 });
exports.default = mongoose_1.default.model('Debt', DebtSchema);
//# sourceMappingURL=Debt.js.map