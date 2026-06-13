"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runInventoryForecastJob = void 0;
const Inventory_1 = __importDefault(require("../models/Inventory"));
const Transaction_1 = __importDefault(require("../models/Transaction"));
const notification_service_1 = require("../services/notification.service");
const logger_1 = require("../utils/logger");
const runInventoryForecastJob = async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const salesVelocity = await Transaction_1.default.aggregate([
        { $match: { type: 'sale', createdAt: { $gte: thirtyDaysAgo }, productName: { $ne: null } } },
        { $group: { _id: { userId: '$userId', product: '$productName' }, totalQty: { $sum: '$quantity' } } },
    ]);
    const items = await Inventory_1.default.find({ isActive: true, quantity: { $gt: 0 } });
    for (const item of items) {
        const velocity = salesVelocity.find((v) => String(v._id.userId) === String(item.userId) &&
            v._id.product?.toLowerCase() === item.name.toLowerCase());
        const dailyRate = velocity ? velocity.totalQty / 30 : 0;
        const forecastedDays = dailyRate > 0 ? Math.floor(item.quantity / dailyRate) : null;
        await Inventory_1.default.findByIdAndUpdate(item._id, { forecastedStockoutDays: forecastedDays });
        // Alert if will run out in <= 3 days
        if (forecastedDays !== null && forecastedDays <= 3) {
            await (0, notification_service_1.createAndSendNotification)(String(item.userId), 'low_stock', 'Low Stock Alert', `${item.name} will run out in ~${forecastedDays} days. Only ${item.quantity} ${item.unit} left.`, 'push');
        }
    }
    logger_1.logger.info(`Inventory forecast updated for ${items.length} items`);
};
exports.runInventoryForecastJob = runInventoryForecastJob;
//# sourceMappingURL=inventoryForecast.job.js.map