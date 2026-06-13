"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectFraud = void 0;
const Transaction_1 = __importDefault(require("../models/Transaction"));
const FraudAlert_1 = __importDefault(require("../models/FraudAlert"));
const logger_1 = require("../utils/logger");
const mongoose_1 = __importDefault(require("mongoose"));
const detectFraud = async (userId, transactionId) => {
    try {
        const tx = await Transaction_1.default.findById(transactionId);
        if (!tx)
            return;
        const uid = new mongoose_1.default.Types.ObjectId(userId);
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        // Rule 1: Rapid transactions (> 10 in 5 minutes)
        const recentCount = await Transaction_1.default.countDocuments({
            userId: uid,
            createdAt: { $gte: fiveMinutesAgo },
        });
        if (recentCount > 10) {
            await createAlert(userId, transactionId, 'rapid_transactions', 'high', `${recentCount} transactions in 5 minutes`);
        }
        // Rule 2: Unusual amount (5x average)
        const avgResult = await Transaction_1.default.aggregate([
            { $match: { userId: uid, type: tx.type } },
            { $group: { _id: null, avg: { $avg: '$amount' } } },
        ]);
        const avg = avgResult[0]?.avg || 0;
        if (avg > 0 && tx.amount > avg * 5) {
            await createAlert(userId, transactionId, 'unusual_amount', 'medium', `Amount ₦${tx.amount} is 5x the average ₦${Math.round(avg)}`);
        }
    }
    catch (err) {
        logger_1.logger.error('Fraud detection error:', err);
    }
};
exports.detectFraud = detectFraud;
const createAlert = async (userId, transactionId, alertType, severity, description) => {
    await FraudAlert_1.default.create({ userId, transactionId, alertType, severity, description });
    await Transaction_1.default.findByIdAndUpdate(transactionId, { fraudFlag: true, fraudReason: description });
};
//# sourceMappingURL=fraud.service.js.map