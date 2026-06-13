"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveFraudAlert = exports.getFraudAlerts = exports.getDashboardStats = exports.toggleUserStatus = exports.listUsers = void 0;
const response_1 = require("../utils/response");
const pagination_1 = require("../utils/pagination");
const User_1 = __importDefault(require("../models/User"));
const FraudAlert_1 = __importDefault(require("../models/FraudAlert"));
const Transaction_1 = __importDefault(require("../models/Transaction"));
const listUsers = async (req, res) => {
    const { page, limit } = (0, pagination_1.getPagination)(req);
    const query = {};
    if (req.query.role)
        query.role = req.query.role;
    if (req.query.search)
        query.$or = [
            { firstName: new RegExp(req.query.search, 'i') },
            { phone: new RegExp(req.query.search, 'i') },
        ];
    const [data, total] = await Promise.all([
        User_1.default.find(query).select('-passwordHash').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
        User_1.default.countDocuments(query),
    ]);
    (0, response_1.sendPaginated)(res, data, total, page, limit);
};
exports.listUsers = listUsers;
const toggleUserStatus = async (req, res) => {
    const user = await User_1.default.findByIdAndUpdate(req.params.id, [{ $set: { isActive: { $not: '$isActive' } } }], { new: true });
    (0, response_1.sendSuccess)(res, user, 'User status updated');
};
exports.toggleUserStatus = toggleUserStatus;
const getDashboardStats = async (req, res) => {
    const [totalUsers, activeUsers, totalTransactions, fraudAlerts] = await Promise.all([
        User_1.default.countDocuments(),
        User_1.default.countDocuments({ isActive: true }),
        Transaction_1.default.countDocuments(),
        FraudAlert_1.default.countDocuments({ resolved: false }),
    ]);
    (0, response_1.sendSuccess)(res, { totalUsers, activeUsers, totalTransactions, fraudAlerts }, 'Dashboard stats');
};
exports.getDashboardStats = getDashboardStats;
const getFraudAlerts = async (req, res) => {
    const { page, limit } = (0, pagination_1.getPagination)(req);
    const [data, total] = await Promise.all([
        FraudAlert_1.default.find({ resolved: false }).populate('userId', 'firstName lastName phone').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
        FraudAlert_1.default.countDocuments({ resolved: false }),
    ]);
    (0, response_1.sendPaginated)(res, data, total, page, limit);
};
exports.getFraudAlerts = getFraudAlerts;
const resolveFraudAlert = async (req, res) => {
    await FraudAlert_1.default.findByIdAndUpdate(req.params.id, {
        resolved: true,
        resolvedBy: req.user._id,
        resolvedAt: new Date(),
    });
    (0, response_1.sendSuccess)(res, null, 'Fraud alert resolved');
};
exports.resolveFraudAlert = resolveFraudAlert;
//# sourceMappingURL=admin.controller.js.map