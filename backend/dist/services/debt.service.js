"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDebtSummary = exports.recordPayment = exports.createDebt = void 0;
const Debt_1 = __importDefault(require("../models/Debt"));
const Customer_1 = __importDefault(require("../models/Customer"));
const appError_1 = require("../utils/appError");
const customer_service_1 = require("./customer.service");
const createDebt = async (userId, data) => {
    const customer = await (0, customer_service_1.findOrCreateCustomer)(userId, data.customerName, data.phone);
    const debt = await Debt_1.default.create({
        userId,
        customerId: customer._id,
        customerName: data.customerName,
        amount: data.amount,
        balance: data.amount,
        amountPaid: 0,
        dueDate: data.dueDate,
        productName: data.productName,
        notes: data.notes,
        source: data.source || 'manual',
    });
    await Customer_1.default.findByIdAndUpdate(customer._id, {
        $inc: { totalDebt: data.amount },
        lastTransactionAt: new Date(),
    });
    return debt;
};
exports.createDebt = createDebt;
const recordPayment = async (userId, debtId, amount, method = 'cash') => {
    const debt = await Debt_1.default.findOne({ _id: debtId, userId });
    if (!debt)
        throw new appError_1.AppError('Debt record not found', 404);
    if (debt.status === 'settled')
        throw new appError_1.AppError('Debt already settled', 400);
    if (amount > debt.balance)
        throw new appError_1.AppError('Payment exceeds outstanding balance', 400);
    const newAmountPaid = debt.amountPaid + amount;
    const newBalance = debt.amount - newAmountPaid;
    const newStatus = newBalance === 0 ? 'settled' : 'partial';
    const updated = await Debt_1.default.findByIdAndUpdate(debtId, {
        $inc: { amountPaid: amount },
        balance: newBalance,
        status: newStatus,
        $push: { payments: { amount, paidAt: new Date(), method } },
    }, { new: true });
    // Update customer debt repayment rate
    const allDebts = await Debt_1.default.find({ customerId: debt.customerId });
    const totalDebts = allDebts.length;
    const settledDebts = allDebts.filter((d) => d.status === 'settled').length;
    await Customer_1.default.findByIdAndUpdate(debt.customerId, {
        debtRepaymentRate: totalDebts > 0 ? settledDebts / totalDebts : 0,
        $inc: { totalDebt: -amount },
    });
    return updated;
};
exports.recordPayment = recordPayment;
const getDebtSummary = async (userId) => {
    const debts = await Debt_1.default.aggregate([
        { $match: { userId: debt_userId_to_objectid(userId) } },
        { $group: { _id: '$status', total: { $sum: '$balance' }, count: { $sum: 1 } } },
    ]);
    return debts;
};
exports.getDebtSummary = getDebtSummary;
// Helper to avoid mongoose import in aggregation
const debt_userId_to_objectid = (userId) => {
    const { Types } = require('mongoose');
    return new Types.ObjectId(userId);
};
//# sourceMappingURL=debt.service.js.map