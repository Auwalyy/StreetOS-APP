"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMarketIntelligence = exports.calculateCreditScore = exports.calculateHealthScore = exports.chatWithAdvisor = exports.getDailyBriefing = exports.callAIService = exports.processVoiceAudio = void 0;
const axios_1 = __importDefault(require("axios"));
const form_data_1 = __importDefault(require("form-data"));
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
const Transaction_1 = __importDefault(require("../models/Transaction"));
const Inventory_1 = __importDefault(require("../models/Inventory"));
const Debt_1 = __importDefault(require("../models/Debt"));
const mongoose_1 = __importDefault(require("mongoose"));
const aiClient = axios_1.default.create({
    baseURL: env_1.config.aiService.url,
    timeout: 45000,
});
// ─── Generic caller ───────────────────────────────────────────────────────────
const callAI = async (endpoint, data) => {
    try {
        const response = await aiClient.post(endpoint, data);
        return response.data;
    }
    catch (error) {
        logger_1.logger.error(`AI service error [${endpoint}]:`, error?.response?.data || error.message);
        throw new Error('AI service temporarily unavailable');
    }
};
// ─── Voice (multipart upload) ─────────────────────────────────────────────────
const processVoiceAudio = async (audioBuffer, language) => {
    const form = new form_data_1.default();
    form.append('audio', audioBuffer, { filename: 'recording.wav', contentType: 'audio/wav' });
    form.append('language', language);
    try {
        const response = await aiClient.post('/voice/process', form, {
            headers: form.getHeaders(),
            timeout: 45000,
        });
        return response.data;
    }
    catch (error) {
        logger_1.logger.error('Voice processing error:', error?.response?.data || error.message);
        throw new Error('Voice processing failed');
    }
};
exports.processVoiceAudio = processVoiceAudio;
// ─── Context helpers ──────────────────────────────────────────────────────────
const getBusinessContext = async (userId) => {
    const uid = new mongoose_1.default.Types.ObjectId(userId);
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [yesterdayRevenue, lowStockItems, overdueDebts] = await Promise.all([
        Transaction_1.default.aggregate([
            { $match: { userId: uid, type: 'sale', createdAt: { $gte: yesterday } } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]),
        Inventory_1.default.find({ userId: uid, $expr: { $lte: ['$quantity', '$lowStockThreshold'] } })
            .select('name quantity lowStockThreshold').limit(10).lean(),
        Debt_1.default.find({ userId: uid, status: { $in: ['pending', 'partial'] }, dueDate: { $lt: new Date() } })
            .select('customerName balance').limit(10).lean(),
    ]);
    return {
        yesterday_revenue: yesterdayRevenue[0]?.total || 0,
        recent_revenue: yesterdayRevenue[0]?.total || 0,
        low_stock_items: lowStockItems.map((i) => i.name),
        overdue_debts: overdueDebts.map((d) => `${d.customerName} (₦${d.balance})`),
    };
};
const getUserScoreData = async (userId) => {
    const uid = new mongoose_1.default.Types.ObjectId(userId);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const [user, txStats, debtStats, inventory] = await Promise.all([
        mongoose_1.default.model('User').findById(uid).select('kycStatus businessRegisteredAt createdAt').lean(),
        Transaction_1.default.aggregate([
            { $match: { userId: uid, createdAt: { $gte: thirtyDaysAgo } } },
            { $group: { _id: '$type', total: { $sum: '$amount' }, activeDays: { $addToSet: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } } } },
        ]),
        Debt_1.default.aggregate([
            { $match: { userId: uid } },
            { $group: { _id: null, total: { $sum: 1 }, settled: { $sum: { $cond: [{ $eq: ['$status', 'settled'] }, 1, 0] } } } },
        ]),
        Inventory_1.default.find({ userId: uid, isActive: true }).lean(),
    ]);
    const salesStats = txStats.find((t) => t._id === 'sale') || { total: 0, activeDays: [] };
    const registeredAt = user?.businessRegisteredAt || user?.createdAt || new Date();
    const daysSinceReg = Math.floor((Date.now() - new Date(registeredAt).getTime()) / (1000 * 60 * 60 * 24));
    const revPrev = await Transaction_1.default.aggregate([
        { $match: { userId: uid, type: 'sale', createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const lowStockCount = inventory.filter((i) => i.quantity <= i.lowStockThreshold).length;
    const inventoryScore = inventory.length > 0
        ? Math.max(0, 100 - (lowStockCount / inventory.length) * 100)
        : 70;
    return {
        active_trading_days: salesStats.activeDays?.length || 0,
        days_since_registration: Math.max(daysSinceReg, 1),
        average_monthly_revenue: salesStats.total || 0,
        revenue_30d: salesStats.total || 0,
        revenue_prev_30d: revPrev[0]?.total || 0,
        active_days_30: salesStats.activeDays?.length || 0,
        debt_repayment_rate: debtStats[0] ? debtStats[0].settled / Math.max(debtStats[0].total, 1) : 0.5,
        debt_collection_rate: debtStats[0] ? debtStats[0].settled / Math.max(debtStats[0].total, 1) : 0.5,
        kyc_status: user?.kycStatus || 'none',
        inventory_management_score: inventoryScore,
        customer_retention_rate: 0.6,
    };
};
// ─── Exported service methods ─────────────────────────────────────────────────
exports.callAIService = callAI;
const getDailyBriefing = async (userId, language) => {
    const context = await getBusinessContext(userId);
    return callAI('/advisor/briefing', { userId, language, ...context });
};
exports.getDailyBriefing = getDailyBriefing;
const chatWithAdvisor = async (userId, message, language) => {
    const context = await getBusinessContext(userId);
    return callAI('/advisor/chat', { userId, message, language, ...context });
};
exports.chatWithAdvisor = chatWithAdvisor;
const calculateHealthScore = async (userId) => {
    const data = await getUserScoreData(userId);
    return callAI('/scoring/health', { userId, ...data });
};
exports.calculateHealthScore = calculateHealthScore;
const calculateCreditScore = async (userId) => {
    const data = await getUserScoreData(userId);
    return callAI('/scoring/credit', { userId, ...data });
};
exports.calculateCreditScore = calculateCreditScore;
const getMarketIntelligence = async (region, productCategory) => {
    return callAI('/market/intelligence', { region, productCategory });
};
exports.getMarketIntelligence = getMarketIntelligence;
//# sourceMappingURL=ai.service.js.map