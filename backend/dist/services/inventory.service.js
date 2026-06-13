"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInventoryForecast = exports.getLowStockAlerts = exports.updateInventoryItem = exports.createInventoryItem = exports.getInventory = void 0;
const Inventory_1 = __importDefault(require("../models/Inventory"));
const Transaction_1 = __importDefault(require("../models/Transaction"));
const appError_1 = require("../utils/appError");
const mongoose_1 = __importDefault(require("mongoose"));
const getInventory = async (userId, page, limit, search) => {
    const query = { userId, isActive: true };
    if (search)
        query.name = new RegExp(search, 'i');
    const [data, total] = await Promise.all([
        Inventory_1.default.find(query).sort({ name: 1 }).skip((page - 1) * limit).limit(limit),
        Inventory_1.default.countDocuments(query),
    ]);
    return { data, total };
};
exports.getInventory = getInventory;
const createInventoryItem = async (userId, data) => {
    const exists = await Inventory_1.default.findOne({ userId, name: new RegExp(`^${data.name}$`, 'i'), isActive: true });
    if (exists)
        throw new appError_1.AppError('Item with this name already exists', 409);
    return Inventory_1.default.create({ userId, ...data });
};
exports.createInventoryItem = createInventoryItem;
const updateInventoryItem = async (userId, itemId, data) => {
    const item = await Inventory_1.default.findOneAndUpdate({ _id: itemId, userId }, data, { new: true });
    if (!item)
        throw new appError_1.AppError('Inventory item not found', 404);
    return item;
};
exports.updateInventoryItem = updateInventoryItem;
const getLowStockAlerts = async (userId) => {
    return Inventory_1.default.find({
        userId,
        isActive: true,
        $expr: { $lte: ['$quantity', '$lowStockThreshold'] },
    });
};
exports.getLowStockAlerts = getLowStockAlerts;
const getInventoryForecast = async (userId) => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const salesVelocity = await Transaction_1.default.aggregate([
        { $match: { userId: new mongoose_1.default.Types.ObjectId(userId), type: 'sale', createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: '$productName', totalQty: { $sum: '$quantity' } } },
    ]);
    const items = await Inventory_1.default.find({ userId, isActive: true });
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
exports.getInventoryForecast = getInventoryForecast;
//# sourceMappingURL=inventory.service.js.map