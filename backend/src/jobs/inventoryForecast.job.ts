import Inventory from '../models/Inventory';
import Transaction from '../models/Transaction';
import { createAndSendNotification } from '../services/notification.service';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

export const runInventoryForecastJob = async () => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const salesVelocity = await Transaction.aggregate([
    { $match: { type: 'sale', createdAt: { $gte: thirtyDaysAgo }, productName: { $ne: null } } },
    { $group: { _id: { userId: '$userId', product: '$productName' }, totalQty: { $sum: '$quantity' } } },
  ]);

  const items = await Inventory.find({ isActive: true, quantity: { $gt: 0 } });

  for (const item of items) {
    const velocity = salesVelocity.find(
      (v) => String(v._id.userId) === String(item.userId) &&
             v._id.product?.toLowerCase() === item.name.toLowerCase()
    );

    const dailyRate = velocity ? velocity.totalQty / 30 : 0;
    const forecastedDays = dailyRate > 0 ? Math.floor(item.quantity / dailyRate) : null;

    await Inventory.findByIdAndUpdate(item._id, { forecastedStockoutDays: forecastedDays });

    // Alert if will run out in <= 3 days
    if (forecastedDays !== null && forecastedDays <= 3) {
      await createAndSendNotification(
        String(item.userId),
        'low_stock',
        'Low Stock Alert',
        `${item.name} will run out in ~${forecastedDays} days. Only ${item.quantity} ${item.unit} left.`,
        'push'
      );
    }
  }

  logger.info(`Inventory forecast updated for ${items.length} items`);
};
