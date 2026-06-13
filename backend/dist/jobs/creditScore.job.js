"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCreditScoreJob = exports.runCreditScoreForUser = void 0;
const User_1 = __importDefault(require("../models/User"));
const CreditScore_1 = __importDefault(require("../models/CreditScore"));
const Transaction_1 = __importDefault(require("../models/Transaction"));
const Debt_1 = __importDefault(require("../models/Debt"));
const logger_1 = require("../utils/logger");
const runCreditScoreForUser = async (userId) => {
    const user = await User_1.default.findById(userId).select('_id kycStatus createdAt');
    if (!user)
        throw new Error('User not found');
    const score = await computeCreditScore(user);
    const saved = await CreditScore_1.default.create({ userId, ...score, calculatedAt: new Date() });
    return saved;
};
exports.runCreditScoreForUser = runCreditScoreForUser;
const runCreditScoreJob = async () => {
    const users = await User_1.default.find({ isActive: true }).select('_id kycStatus createdAt');
    let processed = 0;
    for (const user of users) {
        try {
            const score = await computeCreditScore(user);
            await CreditScore_1.default.create({ userId: user._id, ...score, calculatedAt: new Date() });
            processed++;
        }
        catch (err) {
            logger_1.logger.error(`Credit score failed for ${user._id}:`, err);
        }
    }
    logger_1.logger.info(`Credit scores computed for ${processed}/${users.length} users`);
};
exports.runCreditScoreJob = runCreditScoreJob;
const computeCreditScore = async (user) => {
    const uid = user._id;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [txDays, avgRevenue, settledDebts, totalDebts] = await Promise.all([
        Transaction_1.default.distinct('createdAt', { userId: uid, createdAt: { $gte: thirtyDaysAgo } }),
        Transaction_1.default.aggregate([{ $match: { userId: uid, type: 'sale' } }, { $group: { _id: null, avg: { $avg: '$amount' } } }]),
        Debt_1.default.countDocuments({ userId: uid, status: 'settled' }),
        Debt_1.default.countDocuments({ userId: uid }),
    ]);
    const daysSinceReg = Math.max(Math.floor((Date.now() - (user.createdAt?.getTime() || Date.now())) / (1000 * 60 * 60 * 24)), 1);
    const components = {
        transactionConsistency: Math.min(txDays.length / 25, 1),
        revenueLevel: Math.min((avgRevenue[0]?.avg || 0) / 500000, 1),
        debtRepaymentBehavior: totalDebts > 0 ? settledDebts / totalDebts : 0.5,
        businessAge: Math.min(daysSinceReg / 365, 1),
        identityVerification: user.kycStatus === 'verified' ? 1 : user.kycStatus === 'pending' ? 0.5 : 0,
    };
    const raw = (components.transactionConsistency * 0.30 +
        components.revenueLevel * 0.20 +
        components.debtRepaymentBehavior * 0.25 +
        components.businessAge * 0.10 +
        components.identityVerification * 0.15);
    const score = Math.round(300 + raw * 550);
    const loanEligibility = score >= 670 ? 'eligible' : score >= 580 ? 'conditional' : 'ineligible';
    const maxLoan = Math.round((score - 300) * 200);
    return {
        score,
        components,
        loanEligibility,
        recommendedLoanRange: { min: Math.round(maxLoan * 0.2), max: maxLoan },
        improvements: score < 670 ? ['Record transactions daily', 'Repay debts on time', 'Complete KYC verification'] : [],
    };
};
//# sourceMappingURL=creditScore.job.js.map