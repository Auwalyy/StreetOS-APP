import Inventory from '../models/Inventory';
import Transaction from '../models/Transaction';
import { AppError } from '../utils/appError';
import mongoose from 'mongoose';

export const getInventory = async (userId: string, page: number, limit: number, search?: string) => {
  const query: Record<string, unknown> = { userId, isActive: true };
  if (search) query.name = new RegExp(search, 'i');

  const [data, total] = await Promise.all([
    Inventory.find(query).sort({ name: 1 }).skip((page - 1) * limit).limit(limit),
    Inventory.countDocuments(query),
  ]);
  return { data, total };
};

export const createInventoryItem = async (userId: string, data: Record<string, unknown>) => {
  const exists = await Inventory.findOne({ userId, name: new RegExp(`^${data.name}$`, 'i'), isActive: true });
  if (exists) throw new AppError('Item with this name already exists', 409);
  return Inventory.create({ userId, ...data });
};

export const updateInventoryItem = async (userId: string, itemId: string, data: Record<string, unknown>) => {
  const item = await Inventory.findOneAndUpdate({ _id: itemId, userId }, data, { new: true });
  if (!item) throw new AppError('Inventory item not found', 404);
  return item;
};

export const getLowStockAlerts = async (userId: string) => {
  return Inventory.find({
    userId,
    isActive: true,
    $expr: { $lte: ['$quantity', '$lowStockThreshold'] },
  });
};

export const getInventoryForecast = async (userId: string) => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const salesVelocity = await Transaction.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), type: 'sale', createdAt: { $gte: thirtyDaysAgo } } },
    { $group: { _id: '$productName', totalQty: { $sum: '$quantity' } } },
  ]);

  const items = await Inventory.find({ userId, isActive: true });

  return items.map((item) => {
    const velocity = salesVelocity.find((v) => v._id?.toLowerCase() === item.name.toLowerCase());
    const dailyRate = velocity ? velocity.totalQty / 30 : 0;
    const daysUntilStockout = dailyRate > 0 ? Math.floor(item.quantity / dailyRate) : null;

    return {
      ...item.toObject(),
      dailySalesRate: dailyRate,
      daysUntilStockout,
      needsReorder: daysUntilStockout !== null && daysUntilStockout <= 7,
    };
  });
};
