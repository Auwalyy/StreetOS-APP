import axios from 'axios';
import FormData from 'form-data';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import Transaction from '../models/Transaction';
import Inventory from '../models/Inventory';
import Debt from '../models/Debt';
import mongoose from 'mongoose';

const aiClient = axios.create({
  baseURL: config.aiService.url,
  timeout: 45000,
});

// ─── Generic caller ───────────────────────────────────────────────────────────

const callAI = async (endpoint: string, data: Record<string, unknown>) => {
  try {
    const response = await aiClient.post(endpoint, data);
    return response.data;
  } catch (error: any) {
    logger.error(`AI service error [${endpoint}]:`, error?.response?.data || error.message);
    throw new Error('AI service temporarily unavailable');
  }
};

// ─── Voice (multipart upload) ─────────────────────────────────────────────────

export const processVoiceAudio = async (audioBuffer: Buffer, language: string) => {
  const form = new FormData();
  form.append('audio', audioBuffer, { filename: 'recording.wav', contentType: 'audio/wav' });
  form.append('language', language);

  try {
    const response = await aiClient.post('/voice/process', form, {
      headers: form.getHeaders(),
      timeout: 45000,
    });
    return response.data;
  } catch (error: any) {
    logger.error('Voice processing error:', error?.response?.data || error.message);
    throw new Error('Voice processing failed');
  }
};

// ─── Context helpers ──────────────────────────────────────────────────────────

const getBusinessContext = async (userId: string) => {
  const uid = new mongoose.Types.ObjectId(userId);
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [yesterdayRevenue, lowStockItems, overdueDebts] = await Promise.all([
    Transaction.aggregate([
      { $match: { userId: uid, type: 'sale', createdAt: { $gte: yesterday } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    Inventory.find({ userId: uid, $expr: { $lte: ['$quantity', '$lowStockThreshold'] } })
      .select('name quantity lowStockThreshold').limit(10).lean(),
    Debt.find({ userId: uid, status: { $in: ['pending', 'partial'] }, dueDate: { $lt: new Date() } })
      .select('customerName balance').limit(10).lean(),
  ]);

  return {
    yesterday_revenue: yesterdayRevenue[0]?.total || 0,
    recent_revenue: yesterdayRevenue[0]?.total || 0,
    low_stock_items: lowStockItems.map((i) => i.name),
    overdue_debts: overdueDebts.map((d) => `${d.customerName} (₦${d.balance})`),
  };
};

const getUserScoreData = async (userId: string) => {
  const uid = new mongoose.Types.ObjectId(userId);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

  const [user, txStats, debtStats, inventory] = await Promise.all([
    mongoose.model('User').findById(uid).select('kycStatus businessRegisteredAt createdAt').lean() as any,
    Transaction.aggregate([
      { $match: { userId: uid, createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: '$type', total: { $sum: '$amount' }, activeDays: { $addToSet: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } } } },
    ]),
    Debt.aggregate([
      { $match: { userId: uid } },
      { $group: { _id: null, total: { $sum: 1 }, settled: { $sum: { $cond: [{ $eq: ['$status', 'settled'] }, 1, 0] } } } },
    ]),
    Inventory.find({ userId: uid, isActive: true }).lean(),
  ]);

  const salesStats = txStats.find((t: any) => t._id === 'sale') || { total: 0, activeDays: [] };
  const registeredAt = user?.businessRegisteredAt || user?.createdAt || new Date();
  const daysSinceReg = Math.floor((Date.now() - new Date(registeredAt).getTime()) / (1000 * 60 * 60 * 24));

  const revPrev = await Transaction.aggregate([
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
    kyc_status: (user as any)?.kycStatus || 'none',
    inventory_management_score: inventoryScore,
    customer_retention_rate: 0.6,
  };
};

// ─── Exported service methods ─────────────────────────────────────────────────

export const callAIService = callAI;

export const getDailyBriefing = async (userId: string, language: string) => {
  const context = await getBusinessContext(userId);
  return callAI('/advisor/briefing', { userId, language, ...context });
};

export const chatWithAdvisor = async (userId: string, message: string, language: string) => {
  const context = await getBusinessContext(userId);
  return callAI('/advisor/chat', { userId, message, language, ...context });
};

export const calculateHealthScore = async (userId: string) => {
  const data = await getUserScoreData(userId);
  return callAI('/scoring/health', { userId, ...data });
};

export const calculateCreditScore = async (userId: string) => {
  const data = await getUserScoreData(userId);
  return callAI('/scoring/credit', { userId, ...data });
};

export const getMarketIntelligence = async (region: string, productCategory?: string) => {
  return callAI('/market/intelligence', { region, productCategory });
};
