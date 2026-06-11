import Transaction from '../models/Transaction';
import FraudAlert from '../models/FraudAlert';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

export const detectFraud = async (userId: string, transactionId: string) => {
  try {
    const tx = await Transaction.findById(transactionId);
    if (!tx) return;

    const uid = new mongoose.Types.ObjectId(userId);
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    // Rule 1: Rapid transactions (> 10 in 5 minutes)
    const recentCount = await Transaction.countDocuments({
      userId: uid,
      createdAt: { $gte: fiveMinutesAgo },
    });
    if (recentCount > 10) {
      await createAlert(userId, transactionId, 'rapid_transactions', 'high', `${recentCount} transactions in 5 minutes`);
    }

    // Rule 2: Unusual amount (5x average)
    const avgResult = await Transaction.aggregate([
      { $match: { userId: uid, type: tx.type } },
      { $group: { _id: null, avg: { $avg: '$amount' } } },
    ]);
    const avg = avgResult[0]?.avg || 0;
    if (avg > 0 && tx.amount > avg * 5) {
      await createAlert(userId, transactionId, 'unusual_amount', 'medium', `Amount ₦${tx.amount} is 5x the average ₦${Math.round(avg)}`);
    }
  } catch (err) {
    logger.error('Fraud detection error:', err);
  }
};

const createAlert = async (userId: string, transactionId: string, alertType: string, severity: string, description: string) => {
  await FraudAlert.create({ userId, transactionId, alertType, severity, description });
  await Transaction.findByIdAndUpdate(transactionId, { fraudFlag: true, fraudReason: description });
};
