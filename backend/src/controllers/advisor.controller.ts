import { Request, Response } from 'express';
import { sendSuccess } from '../utils/response';
import MarketIntelligence from '../models/MarketIntelligence';
import Transaction from '../models/Transaction';
import Inventory from '../models/Inventory';
import Debt from '../models/Debt';
import HealthScore from '../models/HealthScore';
import CreditScore from '../models/CreditScore';
import mongoose from 'mongoose';

const getContext = async (userId: string) => {
  const uid = new mongoose.Types.ObjectId(userId);
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [revResult, lowStock, overdueDebts, health, credit] = await Promise.all([
    Transaction.aggregate([
      { $match: { userId: uid, type: 'sale', createdAt: { $gte: yesterday } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    Inventory.find({ userId: uid, $expr: { $lte: ['$quantity', '$lowStockThreshold'] } }).select('name quantity').limit(5).lean(),
    Debt.find({ userId: uid, status: { $in: ['pending', 'partial'] }, dueDate: { $lt: new Date() } }).select('debtorName remainingAmount').limit(5).lean(),
    HealthScore.findOne({ userId: uid }).sort({ calculatedAt: -1 }).lean(),
    CreditScore.findOne({ userId: uid }).sort({ calculatedAt: -1 }).lean(),
  ]);

  const monthlyRev = await Transaction.aggregate([
    { $match: { userId: uid, type: 'sale', createdAt: { $gte: thirtyDaysAgo } } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  return {
    todayRevenue: revResult[0]?.total || 0,
    todaySales: revResult[0]?.count || 0,
    monthlyRevenue: monthlyRev[0]?.total || 0,
    lowStock,
    overdueDebts,
    healthScore: health?.score || 0,
    creditScore: credit?.score || 0,
  };
};

const generateInsight = (message: string, ctx: Awaited<ReturnType<typeof getContext>>): string => {
  const msg = message.toLowerCase();

  if (msg.includes('sale') || msg.includes('revenue') || msg.includes('income') || msg.includes('money')) {
    return ctx.todayRevenue > 0
      ? `Today you've made ₦${ctx.todayRevenue.toLocaleString()} from ${ctx.todaySales} sale(s). This month your total revenue is ₦${ctx.monthlyRevenue.toLocaleString()}. ${
          ctx.monthlyRevenue > 50000
            ? 'Great momentum! Keep tracking every transaction to build your credit score.'
            : 'Record every sale — even small ones — to build your financial history and qualify for loans.'
        }`
      : `No sales recorded today yet. Make sure to log every transaction — your financial history is your most valuable asset for accessing credit.`;
  }

  if (msg.includes('stock') || msg.includes('inventory') || msg.includes('product')) {
    if (ctx.lowStock.length > 0) {
      const items = ctx.lowStock.map((i: any) => i.name).join(', ');
      return `⚠️ Low stock alert: ${items}. Restock these soon to avoid losing sales. Consistent inventory management improves your business health score (currently ${ctx.healthScore}/100).`;
    }
    return `Your inventory looks healthy. Keep your stock levels updated — it directly impacts your Business Health Score (${ctx.healthScore}/100) which lenders use to assess your business.`;
  }

  if (msg.includes('debt') || msg.includes('owe') || msg.includes('credit') || msg.includes('loan')) {
    if (ctx.overdueDebts.length > 0) {
      const names = ctx.overdueDebts.map((d: any) => d.debtorName).join(', ');
      return `You have ${ctx.overdueDebts.length} overdue debt(s) from: ${names}. Follow up immediately — recovering these improves your cash flow and credit score. Your current credit score is ${ctx.creditScore}/850.`;
    }
    return `Your debt book is clean — no overdue records. Your credit score is ${ctx.creditScore}/850. ${
      ctx.creditScore >= 670
        ? 'This qualifies you for microloans from our lending partners.'
        : 'Keep recording transactions consistently to raise your score above 670 for loan eligibility.'
    }`;
  }

  if (msg.includes('score') || msg.includes('health') || msg.includes('business')) {
    return `Your Business Health Score is ${ctx.healthScore}/100 and Credit Score is ${ctx.creditScore}/850. ${
      ctx.healthScore >= 75
        ? 'Strong health score! Share your Business Passport with lenders and partners to prove your credibility.'
        : 'To improve your health score: record daily transactions, manage inventory, and settle debts on time.'
    } Monthly revenue this period: ₦${ctx.monthlyRevenue.toLocaleString()}.`;
  }

  if (msg.includes('tip') || msg.includes('advice') || msg.includes('improve') || msg.includes('grow') || msg.includes('increase')) {
    const tips = [];
    if (ctx.lowStock.length > 0) tips.push(`Restock ${ctx.lowStock[0].name} to avoid lost sales`);
    if (ctx.overdueDebts.length > 0) tips.push(`Collect overdue payment from ${ctx.overdueDebts[0].debtorName}`);
    if (ctx.healthScore < 75) tips.push('Record at least 1 transaction daily to boost your health score');
    if (ctx.creditScore < 670) tips.push('Settle debts on time to build your credit score above 670');
    if (tips.length === 0) tips.push('Keep up the great work — share your Business Passport with potential partners');
    return `Here are your top actions right now:\n${tips.map((t, i) => `${i + 1}. ${t}`).join('\n')}`;
  }

  if (msg.includes('passport') || msg.includes('identity') || msg.includes('verify')) {
    return `Your Business Passport is your digital identity — it shows your health score (${ctx.healthScore}/100), credit score (${ctx.creditScore}/850), and transaction history to lenders and partners. Go to the Passport section to generate and share yours.`;
  }

  // Default
  return `Hello! I'm your StreetOS advisor. Today's revenue: ₦${ctx.todayRevenue.toLocaleString()} | Health: ${ctx.healthScore}/100 | Credit: ${ctx.creditScore}/850. ${
    ctx.lowStock.length > 0 ? `⚠️ ${ctx.lowStock.length} item(s) low on stock. ` : ''
  }${
    ctx.overdueDebts.length > 0 ? `⚠️ ${ctx.overdueDebts.length} overdue debt(s). ` : ''
  }Ask me about your sales, inventory, debts, scores, or tips to grow your business.`;
};

export const chat = async (req: Request, res: Response) => {
  const { message } = req.body;
  if (!message) { res.status(400).json({ success: false, message: 'message is required' }); return; }
  const ctx = await getContext(String(req.user!._id));
  const response = generateInsight(message, ctx);
  sendSuccess(res, { response }, 'AI response');
};

export const getDailyBriefingHandler = async (req: Request, res: Response) => {
  const ctx = await getContext(String(req.user!._id));
  const parts = [
    `Good morning! Here's your business briefing.`,
    ctx.todayRevenue > 0
      ? `💰 Today so far: ₦${ctx.todayRevenue.toLocaleString()} from ${ctx.todaySales} sale(s).`
      : `💰 No sales recorded yet today. Start logging your transactions!`,
    `📊 This month: ₦${ctx.monthlyRevenue.toLocaleString()} total revenue.`,
    ctx.lowStock.length > 0 ? `⚠️ Low stock: ${ctx.lowStock.map((i: any) => i.name).join(', ')}.` : `📦 Inventory levels look good.`,
    ctx.overdueDebts.length > 0 ? `🔴 ${ctx.overdueDebts.length} overdue debt(s) need follow-up.` : `✅ No overdue debts.`,
    `🏥 Health Score: ${ctx.healthScore}/100 | 💳 Credit Score: ${ctx.creditScore}/850.`,
  ];
  sendSuccess(res, { briefing: parts.join(' ') }, 'Daily briefing');
};

export const getMarketIntelligenceHandler = async (req: Request, res: Response) => {
  const { region, category } = req.query;
  const data = await MarketIntelligence.find({
    ...(region ? { region } : req.user?.location?.state ? { region: req.user.location.state } : {}),
    ...(category && { productCategory: category }),
  }).sort({ createdAt: -1 }).limit(20);
  sendSuccess(res, data, 'Market intelligence');
};
