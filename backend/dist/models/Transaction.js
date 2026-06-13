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
const TransactionSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
        type: String,
        enum: ['sale', 'purchase', 'expense', 'income', 'transfer'],
        required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    quantity: { type: Number, min: 0 },
    unitPrice: { type: Number, min: 0 },
    productId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Inventory', sparse: true },
    productName: String,
    customerName: String,
    customerId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Customer', sparse: true },
    paymentMethod: {
        type: String,
        enum: ['cash', 'transfer', 'credit', 'mobile_money'],
        default: 'cash',
    },
    notes: String,
    voiceTranscript: String,
    source: { type: String, enum: ['voice', 'manual', 'whatsapp', 'ussd'], default: 'manual' },
    isOffline: { type: Boolean, default: false },
    syncedAt: Date,
    receiptUrl: String,
    fraudFlag: { type: Boolean, default: false },
    fraudReason: String,
    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] },
    },
    metadata: { type: mongoose_1.Schema.Types.Mixed },
}, { timestamps: true });
TransactionSchema.index({ userId: 1, createdAt: -1 });
TransactionSchema.index({ userId: 1, type: 1 });
TransactionSchema.index({ userId: 1, productName: 1 });
exports.default = mongoose_1.default.model('Transaction', TransactionSchema);
//# sourceMappingURL=Transaction.js.map