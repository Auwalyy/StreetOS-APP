"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runHealthScoreJob = exports.runHealthScoreForUser = void 0;
const User_1 = __importDefault(require("../models/User"));
const HealthScore_1 = __importDefault(require("../models/HealthScore"));
const Transaction_1 = __importDefault(require("../models/Transaction"));
const Debt_1 = __importDefault(require("../models/Debt"));
const logger_1 = require("../utils/logger");
const mongoose_1 = __importDefault(require("mongoose"));
const runHealthScoreForUser = async (userId) => {
    const score = await computeHealthScore(userId);
    const saved = await HealthScore_1.default.create({ userId, ...score, calculatedAt: new Date() });
    return saved;
};
exports.runHealthScoreForUser = runHealthScoreForUser;
const runHealthScoreJob = async () => {
    const users = await User_1.default.find({ isActive: true, role: { $in: ['trader', 'artisan', 'business_owner', 'food_vendor'] } }).select('_id');
    let processed = 0;
    for (const user of users) {
        try {
            const score = await computeHealthScore(String(user._id));
            await HealthScore_1.default.create({ userId: user._id, ...score, calculatedAt: new Date() });
            processed++;
        }
        catch (err) {
            logger_1.logger.error(`Health score failed for user ${user._id}:`, err);
        }
    }
    logger_1.logger.info(`Health scores computed for ${processed}/${users.length} users`);
};
exports.runHealthScoreJob = runHealthScoreJob;
const computeHealthScore = async (userId) => {
    const uid = new mongoose_1.default.Types.ObjectId(userId);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const [recentSales, previousSales, debts, totalDebts] = await Promise.all([
        Transaction_1.default.aggregate([{ $match: { userId: uid, type: 'sale', createdAt: { $gte: thirtyDaysAgo } } }, { $group: { _id: null, total: { $sum: '$amount' }, days: { $addToSet: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } } } }]),
        Transaction_1.default.aggregate([{ $match: { userId: uid, type: 'sale', createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
        Debt_1.default.countDocuments({ userId: uid, status: 'settled' }),
        Debt_1.default.countDocuments({ userId: uid }),
    ]);
    const revenueConsistency = Math.min((recentSales[0]?.days?.length || 0) / 25, 1) * 100;
    const growth = previousSales[0]?.total > 0 ? Math.min((recentSales[0]?.total || 0) / previousSales[0].total, 2) * 50 : 50;
    const debtCollection = totalDebts > 0 ? (debts / totalDebts) * 100 : 50;
    const components = {
        revenueConsistency: Math.round(revenueConsistency),
        inventoryManagement: 70, // static fallback; replaced by AI service in production
        debtCollection: Math.round(debtCollection),
        customerRetention: 65,
        businessGrowth: Math.round(Math.min(growth, 100)),
    };
    const score = Math.round(components.revenueConsistency * 0.25 +
        components.inventoryManagement * 0.20 +
        components.debtCollection * 0.20 +
        components.customerRetention * 0.15 +
        components.businessGrowth * 0.20);
    const band = score >= 90 ? 'excellent' :
        score >= 75 ? 'good' :
            score >= 60 ? 'fair' :
                score >= 40 ? 'needs_improvement' : 'critical';
    return { score, band, components, strengths: [], weaknesses: [], recommendations: [], narrative: '' };
};
//# sourceMappingURL=healthScore.job.js.map