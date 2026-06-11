import User from '../models/User';
import HealthScore from '../models/HealthScore';
import Transaction from '../models/Transaction';
import Debt from '../models/Debt';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

export const runHealthScoreJob = async () => {
  const users = await User.find({ isActive: true, role: { $in: ['trader', 'artisan', 'business_owner', 'food_vendor'] } }).select('_id');

  let processed = 0;
  for (const user of users) {
    try {
      const score = await computeHealthScore(String(user._id));
      await HealthScore.create({ userId: user._id, ...score, calculatedAt: new Date() });
      processed++;
    } catch (err) {
      logger.error(`Health score failed for user ${user._id}:`, err);
    }
  }

  logger.info(`Health scores computed for ${processed}/${users.length} users`);
};

const computeHealthScore = async (userId: string) => {
  const uid = new mongoose.Types.ObjectId(userId);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

  const [recentSales, previousSales, debts, totalDebts] = await Promise.all([
    Transaction.aggregate([{ $match: { userId: uid, type: 'sale', createdAt: { $gte: thirtyDaysAgo } } }, { $group: { _id: null, total: { $sum: '$amount' }, days: { $addToSet: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } } } }]),
    Transaction.aggregate([{ $match: { userId: uid, type: 'sale', createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Debt.countDocuments({ userId: uid, status: 'settled' }),
    Debt.countDocuments({ userId: uid }),
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

  const score = Math.round(
    components.revenueConsistency * 0.25 +
    components.inventoryManagement * 0.20 +
    components.debtCollection * 0.20 +
    components.customerRetention * 0.15 +
    components.businessGrowth * 0.20
  );

  const band =
    score >= 90 ? 'excellent' :
    score >= 75 ? 'good' :
    score >= 60 ? 'fair' :
    score >= 40 ? 'needs_improvement' : 'critical';

  return { score, band, components, strengths: [], weaknesses: [], recommendations: [], narrative: '' };
};
