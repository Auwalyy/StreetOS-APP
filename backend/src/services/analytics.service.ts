import Transaction from '../models/Transaction';
import Debt from '../models/Debt';
import mongoose from 'mongoose';

export const getCashflow = async (userId: string, period: 'daily' | 'weekly' | 'monthly') => {
  const now = new Date();
  let from: Date;
  let groupBy: string;

  if (period === 'daily') {
    from = new Date(now.setDate(now.getDate() - 30));
    groupBy = '%Y-%m-%d';
  } else if (period === 'weekly') {
    from = new Date(now.setMonth(now.getMonth() - 3));
    groupBy = '%Y-W%V';
  } else {
    from = new Date(now.setFullYear(now.getFullYear() - 1));
    groupBy = '%Y-%m';
  }

  const uid = new mongoose.Types.ObjectId(userId);

  const data = await Transaction.aggregate([
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

export const getProfitLoss = async (userId: string, from: Date, to: Date) => {
  const uid = new mongoose.Types.ObjectId(userId);

  const result = await Transaction.aggregate([
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

export const getTopProducts = async (userId: string, limit = 10) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  return Transaction.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
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

export const getRevenueTrend = async (userId: string) => {
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

  return Transaction.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
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

export const getOutstandingDebtSummary = async (userId: string) => {
  return Debt.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), status: { $in: ['pending', 'partial', 'overdue'] } } },
    { $group: { _id: '$status', totalBalance: { $sum: '$balance' }, count: { $sum: 1 } } },
  ]);
};
