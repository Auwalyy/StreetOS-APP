"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTransactionSummary = exports.getTransactions = exports.syncOfflineTransactions = exports.createVoiceTransaction = exports.createTransaction = void 0;
const Transaction_1 = __importDefault(require("../models/Transaction"));
const Inventory_1 = __importDefault(require("../models/Inventory"));
const Customer_1 = __importDefault(require("../models/Customer"));
const appError_1 = require("../utils/appError");
const ai_service_1 = require("./ai.service");
const fraud_service_1 = require("./fraud.service");
const mongoose_1 = __importDefault(require("mongoose"));
const createTransaction = async (userId, data) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        const transaction = await Transaction_1.default.create([{ userId, ...data }], { session });
        const tx = transaction[0];
        // Update inventory if product involved
        if (tx.productName && tx.quantity) {
            const item = await Inventory_1.default.findOne({ userId, name: new RegExp(tx.productName, 'i') });
            if (item) {
                const delta = tx.type === 'sale' ? -tx.quantity : tx.quantity;
                await Inventory_1.default.findByIdAndUpdate(item._id, { $inc: { quantity: delta } }, { session });
            }
        }
        // Update customer stats
        if (tx.customerId) {
            await Customer_1.default.findByIdAndUpdate(tx.customerId, {
                $inc: { totalPurchases: tx.amount, transactionCount: 1 },
                lastTransactionAt: new Date(),
            }, { session });
        }
        await session.commitTransaction();
        // Async fraud check (non-blocking)
        (0, fraud_service_1.detectFraud)(userId, String(tx._id)).catch(() => { });
        return tx;
    }
    catch (err) {
        await session.abortTransaction();
        throw err;
    }
    finally {
        session.endSession();
    }
};
exports.createTransaction = createTransaction;
const createVoiceTransaction = async (userId, audioBuffer, language, location) => {
    const extracted = await (0, ai_service_1.processVoiceAudio)(audioBuffer, language);
    // Voice endpoint returns { type, data, transcript } — data holds the extracted fields
    const result = extracted?.type === 'transaction' ? extracted.data : null;
    if (!result || (result.confidence ?? 1) < 0.5) {
        throw new appError_1.AppError('Could not understand the voice input. Please try again.', 422);
    }
    const txData = {
        type: result.transaction_type,
        amount: result.total_amount,
        quantity: result.quantity,
        unitPrice: result.unit_price,
        productName: result.product_name,
        customerName: result.customer_name,
        paymentMethod: result.payment_method || 'cash',
        voiceTranscript: extracted.transcript,
        source: 'voice',
        location: location ? { type: 'Point', coordinates: [location.lng, location.lat] } : undefined,
    };
    const tx = await (0, exports.createTransaction)(userId, txData);
    return {
        transaction: {
            ...tx.toObject(),
            voiceTranscript: txData.voiceTranscript,
        },
        confidence: result.confidence ?? 0.9,
        inventoryUpdated: !!txData.productName,
    };
};
exports.createVoiceTransaction = createVoiceTransaction;
const syncOfflineTransactions = async (userId, transactions) => {
    const results = [];
    for (const txData of transactions) {
        try {
            // Dedup check
            const existing = await Transaction_1.default.findOne({
                userId,
                amount: txData.amount,
                productName: txData.productName,
                createdAt: { $gte: new Date(Date.now() - 60000) },
            });
            if (existing) {
                results.push({ status: 'duplicate', id: txData.localId });
                continue;
            }
            const tx = await (0, exports.createTransaction)(userId, { ...txData, isOffline: true, syncedAt: new Date() });
            results.push({ status: 'synced', id: txData.localId, serverId: tx._id });
        }
        catch {
            results.push({ status: 'failed', id: txData.localId });
        }
    }
    return results;
};
exports.syncOfflineTransactions = syncOfflineTransactions;
const getTransactions = async (userId, filters, page, limit) => {
    const query = { userId };
    if (filters.type)
        query.type = filters.type;
    if (filters.from || filters.to) {
        query.createdAt = {};
        if (filters.from)
            query.createdAt.$gte = new Date(filters.from);
        if (filters.to)
            query.createdAt.$lte = new Date(filters.to);
    }
    if (filters.search) {
        query.$or = [
            { productName: new RegExp(filters.search, 'i') },
            { customerName: new RegExp(filters.search, 'i') },
        ];
    }
    const [data, total] = await Promise.all([
        Transaction_1.default.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
        Transaction_1.default.countDocuments(query),
    ]);
    return { data, total };
};
exports.getTransactions = getTransactions;
const getTransactionSummary = async (userId, period) => {
    const now = new Date();
    let from;
    if (period === 'daily') {
        from = new Date();
        from.setHours(0, 0, 0, 0);
    }
    else if (period === 'weekly') {
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    else {
        from = new Date(now.getTime());
        from.setMonth(from.getMonth() - 1);
    }
    const groups = await Transaction_1.default.aggregate([
        { $match: { userId: new mongoose_1.default.Types.ObjectId(userId), createdAt: { $gte: from } } },
        { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 }, qty: { $sum: '$quantity' } } },
    ]);
    const revenue = groups.find((g) => g._id === 'sale')?.total || 0;
    const purchases = groups.find((g) => g._id === 'purchase')?.total || 0;
    const expenses = groups.find((g) => g._id === 'expense')?.total || 0;
    const salesCount = groups.find((g) => g._id === 'sale')?.count || 0;
    const itemsSold = groups.find((g) => g._id === 'sale')?.qty || 0;
    return {
        totalRevenue: revenue,
        totalProfit: revenue - purchases - expenses,
        salesCount,
        itemsSold,
        period,
        breakdown: groups,
    };
};
exports.getTransactionSummary = getTransactionSummary;
//# sourceMappingURL=transaction.service.js.map