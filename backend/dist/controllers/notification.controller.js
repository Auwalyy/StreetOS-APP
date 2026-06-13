"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllRead = exports.markRead = exports.listNotifications = void 0;
const response_1 = require("../utils/response");
const pagination_1 = require("../utils/pagination");
const Notification_1 = __importDefault(require("../models/Notification"));
const listNotifications = async (req, res) => {
    const { page, limit } = (0, pagination_1.getPagination)(req);
    const query = { userId: req.user._id };
    const [data, total] = await Promise.all([
        Notification_1.default.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
        Notification_1.default.countDocuments(query),
    ]);
    (0, response_1.sendPaginated)(res, data, total, page, limit);
};
exports.listNotifications = listNotifications;
const markRead = async (req, res) => {
    await Notification_1.default.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { status: 'read', readAt: new Date() });
    (0, response_1.sendSuccess)(res, null, 'Notification marked as read');
};
exports.markRead = markRead;
const markAllRead = async (req, res) => {
    await Notification_1.default.updateMany({ userId: req.user._id, status: { $ne: 'read' } }, { status: 'read', readAt: new Date() });
    (0, response_1.sendSuccess)(res, null, 'All notifications marked as read');
};
exports.markAllRead = markAllRead;
//# sourceMappingURL=notification.controller.js.map