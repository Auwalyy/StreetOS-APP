import User from '../models/User';
import CreditScore from '../models/CreditScore';
import Transaction from '../models/Transaction';
import Debt from '../models/Debt';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

export const runCreditScoreForUser = async (userId: string) => {
  const user = await User.findById(userId).select('_id kycStatus createdAt');
  if (!user) throw new Error('User not found');
  const score = await computeCreditScore(user as any);
  const saved = await CreditScore.create({ userId, ...score, calculatedAt: new Date() });
  return saved;
};

export const runCreditScoreJob = async () => {
  const users = await User.find({ isActive: true }).select('_id kycStatus createdAt');
  let processed = 0;

  for (const user of users) {
    try {
      const score = await computeCreditScore(user);
      await CreditScore.create({ userId: user._id, ...score, calculatedAt: new Date() });
      processed++;
    } catch (err) {
      logger.error(`Credit score failed for ${user._id}:`, err);
    }
  }

  logger.info(`Credit scores computed for ${processed}/${users.length} users`);
};

const computeCreditScore = async (user: { _id: mongoose.Types.ObjectId; kycStatus: string; createdAt?: Date }) => {
  const uid = user._id;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [txDays, avgRevenue, settledDebts, totalDebts] = await Promise.all([
    Transaction.distinct('createdAt', { userId: uid, createdAt: { $gte: thirtyDaysAgo } }),
    Transaction.aggregate([{ $match: { userId: uid, type: 'sale' } }, { $group: { _id: null, avg: { $avg: '$amount' } } }]),
    Debt.countDocuments({ userId: uid, status: 'settled' }),
    Debt.countDocuments({ userId: uid }),
  ]);

  const daysSinceReg = Math.max(Math.floor((Date.now() - (user.createdAt?.getTime() || Date.now())) / (1000 * 60 * 60 * 24)), 1);

  const components = {
    transactionConsistency: Math.min(txDays.length / 25, 1),
    revenueLevel: Math.min((avgRevenue[0]?.avg || 0) / 500000, 1),
    debtRepaymentBehavior: totalDebts > 0 ? settledDebts / totalDebts : 0.5,
    businessAge: Math.min(daysSinceReg / 365, 1),
    identityVerification: user.kycStatus === 'verified' ? 1 : user.kycStatus === 'pending' ? 0.5 : 0,
  };

  const raw = (
    components.transactionConsistency * 0.30 +
    components.revenueLevel * 0.20 +
    components.debtRepaymentBehavior * 0.25 +
    components.businessAge * 0.10 +
    components.identityVerification * 0.15
  );

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
