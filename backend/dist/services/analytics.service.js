"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOutstandingDebtSummary = exports.getRevenueTrend = exports.getTopProducts = exports.getProfitLoss = exports.getCashflow = void 0;
const Transaction_1 = __importDefault(require("../models/Transaction"));
const Debt_1 = __importDefault(require("../models/Debt"));
const mongoose_1 = __importDefault(require("mongoose"));
const getCashflow = async (userId, period) => {
    const now = new Date();
    let from;
    let groupBy;
    if (period === 'daily') {
        from = new Date(now.setDate(now.getDate() - 30));
        groupBy = '%Y-%m-%d';
    }
    else if (period === 'weekly') {
        from = new Date(now.setMonth(now.getMonth() - 3));
        groupBy = '%Y-W%V';
    }
    else {
        from = new Date(now.setFullYear(now.getFullYear() - 1));
        groupBy = '%Y-%m';
    }
    const uid = new mongoose_1.default.Types.ObjectId(userId);
    const data = await Transaction_1.default.aggregate([
        { $match: { userId: uid, createdAt: { $gte: from } } },
        {
            $group: {
                _id: { period: { $dateToString: { format: groupBy, date: '$createdAt' } }, type: '$type' },
                total: { $sum: '$amount' },
                count: { $sum: 1 },
            },
        },
        { $sort: { '_id.period': 1 } },
    ]);
    return data;
};
exports.getCashflow = getCashflow;
const getProfitLoss = async (userId, from, to) => {
    const uid = new mongoose_1.default.Types.ObjectId(userId);
    const result = await Transaction_1.default.aggregate([
        { $match: { userId: uid, createdAt: { $gte: from, $lte: to } } },
        {
            $group: {
                _id: '$type',
                total: { $sum: '$amount' },
            },
        },
    ]);
    const revenue = result.find((r) => r._id === 'sale')?.total || 0;
    const purchases = result.find((r) => r._id === 'purchase')?.total || 0;
    const expenses = result.find((r) => r._id === 'expense')?.total || 0;
    return {
        revenue,
        expenses: purchases + expenses,
        profit: revenue - purchases - expenses,
        breakdown: result,
    };
};
exports.getProfitLoss = getProfitLoss;
const getTopProducts = async (userId, limit = 10) => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return Transaction_1.default.aggregate([
        {
            $match: {
                userId: new mongoose_1.default.Types.ObjectId(userId),
                type: 'sale',
                createdAt: { $gte: thirtyDaysAgo },
                productName: { $exists: true, $ne: null },
            },
        },
        { $group: { _id: '$productName', totalRevenue: { $sum: '$amount' }, totalQty: { $sum: '$quantity' }, count: { $sum: 1 } } },
        { $sort: { totalRevenue: -1 } },
        { $limit: limit },
    ]);
};
exports.getTopProducts = getTopProducts;
const getRevenueTrend = async (userId) => {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    return Transaction_1.default.aggregate([
        {
            $match: {
                userId: new mongoose_1.default.Types.ObjectId(userId),
                type: 'sale',
                createdAt: { $gte: twelveMonthsAgo },
            },
        },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
                revenue: { $sum: '$amount' },
                transactions: { $sum: 1 },
            },
        },
        { $sort: { _id: 1 } },
    ]);
};
exports.getRevenueTrend = getRevenueTrend;
const getOutstandingDebtSummary = async (userId) => {
    return Debt_1.default.aggregate([
        { $match: { userId: new mongoose_1.default.Types.ObjectId(userId), status: { $in: ['pending', 'partial', 'overdue'] } } },
        { $group: { _id: '$status', totalBalance: { $sum: '$balance' }, count: { $sum: 1 } } },
    ]);
};
exports.getOutstandingDebtSummary = getOutstandingDebtSummary;
//# sourceMappingURL=analytics.service.js.map