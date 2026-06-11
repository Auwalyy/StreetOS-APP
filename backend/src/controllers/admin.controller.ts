import { Request, Response } from 'express';
import { sendSuccess, sendPaginated } from '../utils/response';
import { getPagination } from '../utils/pagination';
import User from '../models/User';
import FraudAlert from '../models/FraudAlert';
import Transaction from '../models/Transaction';
import mongoose from 'mongoose';

export const listUsers = async (req: Request, res: Response) => {
  const { page, limit } = getPagination(req);
  const query: Record<string, unknown> = {};
  if (req.query.role) query.role = req.query.role;
  if (req.query.search) query.$or = [
    { firstName: new RegExp(req.query.search as string, 'i') },
    { phone: new RegExp(req.query.search as string, 'i') },
  ];
  const [data, total] = await Promise.all([
    User.find(query).select('-passwordHash').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    User.countDocuments(query),
  ]);
  sendPaginated(res, data, total, page, limit);
};

export const toggleUserStatus = async (req: Request, res: Response) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    [{ $set: { isActive: { $not: '$isActive' } } }],
    { new: true }
  );
  sendSuccess(res, user, 'User status updated');
};

export const getDashboardStats = async (req: Request, res: Response) => {
  const [totalUsers, activeUsers, totalTransactions, fraudAlerts] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    Transaction.countDocuments(),
    FraudAlert.countDocuments({ resolved: false }),
  ]);
  sendSuccess(res, { totalUsers, activeUsers, totalTransactions, fraudAlerts }, 'Dashboard stats');
};

export const getFraudAlerts = async (req: Request, res: Response) => {
  const { page, limit } = getPagination(req);
  const [data, total] = await Promise.all([
    FraudAlert.find({ resolved: false }).populate('userId', 'firstName lastName phone').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    FraudAlert.countDocuments({ resolved: false }),
  ]);
  sendPaginated(res, data, total, page, limit);
};

export const resolveFraudAlert = async (req: Request, res: Response) => {
  await FraudAlert.findByIdAndUpdate(req.params.id, {
    resolved: true,
    resolvedBy: req.user!._id,
    resolvedAt: new Date(),
  });
  sendSuccess(res, null, 'Fraud alert resolved');
};
