"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCustomerTrustScore = exports.getCustomerById = exports.getCustomers = exports.findOrCreateCustomer = void 0;
const Customer_1 = __importDefault(require("../models/Customer"));
const appError_1 = require("../utils/appError");
const findOrCreateCustomer = async (userId, name, phone) => {
    // Try exact name match first, then alias match
    let customer = await Customer_1.default.findOne({
        userId,
        $or: [
            { name: new RegExp(`^${name}$`, 'i') },
            { aliases: new RegExp(`^${name}$`, 'i') },
        ],
    });
    if (!customer) {
        customer = await Customer_1.default.create({ userId, name, phone, firstTransactionAt: new Date() });
    }
    else if (phone && !customer.phone) {
        customer.phone = phone;
        await customer.save();
    }
    return customer;
};
exports.findOrCreateCustomer = findOrCreateCustomer;
const getCustomers = async (userId, page, limit, search) => {
    const query = { userId };
    if (search)
        query.$or = [
            { name: new RegExp(search, 'i') },
            { phone: new RegExp(search, 'i') },
        ];
    const [data, total] = await Promise.all([
        Customer_1.default.find(query).sort({ lastTransactionAt: -1 }).skip((page - 1) * limit).limit(limit),
        Customer_1.default.countDocuments(query),
    ]);
    return { data, total };
};
exports.getCustomers = getCustomers;
const getCustomerById = async (userId, customerId) => {
    const customer = await Customer_1.default.findOne({ _id: customerId, userId });
    if (!customer)
        throw new appError_1.AppError('Customer not found', 404);
    return customer;
};
exports.getCustomerById = getCustomerById;
const updateCustomerTrustScore = async (customerId) => {
    const customer = await Customer_1.default.findById(customerId);
    if (!customer)
        return;
    const repaymentScore = customer.debtRepaymentRate * 40;
    const volumeScore = Math.min(customer.totalPurchases / 100000, 1) * 30;
    const loyaltyScore = Math.min(customer.transactionCount / 50, 1) * 30;
    const trustScore = Math.round(repaymentScore + volumeScore + loyaltyScore);
    await Customer_1.default.findByIdAndUpdate(customerId, { trustScore });
};
exports.updateCustomerTrustScore = updateCustomerTrustScore;
//# sourceMappingURL=customer.service.js.map