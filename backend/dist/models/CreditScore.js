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
const CreditScoreSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    score: { type: Number, required: true, min: 300, max: 850 },
    components: {
        transactionConsistency: { type: Number, default: 0 },
        revenueLevel: { type: Number, default: 0 },
        debtRepaymentBehavior: { type: Number, default: 0 },
        businessAge: { type: Number, default: 0 },
        identityVerification: { type: Number, default: 0 },
    },
    loanEligibility: {
        type: String,
        enum: ['eligible', 'conditional', 'ineligible'],
        required: true,
    },
    recommendedLoanRange: {
        min: { type: Number, default: 0 },
        max: { type: Number, default: 0 },
    },
    improvements: [String],
    calculatedAt: { type: Date, default: Date.now },
}, { timestamps: true });
CreditScoreSchema.index({ userId: 1, calculatedAt: -1 });
exports.default = mongoose_1.default.model('CreditScore', CreditScoreSchema);
//# sourceMappingURL=CreditScore.js.map