import Debt from '../models/Debt';
import Customer from '../models/Customer';
import { AppError } from '../utils/appError';
import { findOrCreateCustomer } from './customer.service';

export const createDebt = async (userId: string, data: {
  customerName: string;
  amount: number;
  dueDate: Date;
  productName?: string;
  notes?: string;
  source?: string;
  phone?: string;
}) => {
  const customer = await findOrCreateCustomer(userId, data.customerName, data.phone);

  const debt = await Debt.create({
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

  await Customer.findByIdAndUpdate(customer._id, {
    $inc: { totalDebt: data.amount },
    lastTransactionAt: new Date(),
  });

  return debt;
};

export const recordPayment = async (userId: string, debtId: string, amount: number, method = 'cash') => {
  const debt = await Debt.findOne({ _id: debtId, userId });
  if (!debt) throw new AppError('Debt record not found', 404);
  if (debt.status === 'settled') throw new AppError('Debt already settled', 400);
  if (amount > debt.balance) throw new AppError('Payment exceeds outstanding balance', 400);

  const newAmountPaid = debt.amountPaid + amount;
  const newBalance = debt.amount - newAmountPaid;
  const newStatus = newBalance === 0 ? 'settled' : 'partial';

  const updated = await Debt.findByIdAndUpdate(
    debtId,
    {
      $inc: { amountPaid: amount },
      balance: newBalance,
      status: newStatus,
      $push: { payments: { amount, paidAt: new Date(), method } },
    },
    { new: true }
  );

  // Update customer debt repayment rate
  const allDebts = await Debt.find({ customerId: debt.customerId });
  const totalDebts = allDebts.length;
  const settledDebts = allDebts.filter((d) => d.status === 'settled').length;
  await Customer.findByIdAndUpdate(debt.customerId, {
    debtRepaymentRate: totalDebts > 0 ? settledDebts / totalDebts : 0,
    $inc: { totalDebt: -amount },
  });

  return updated;
};

export const getDebtSummary = async (userId: string) => {
  const debts = await Debt.aggregate([
    { $match: { userId: debt_userId_to_objectid(userId) } },
    { $group: { _id: '$status', total: { $sum: '$balance' }, count: { $sum: 1 } } },
  ]);
  return debts;
};

// Helper to avoid mongoose import in aggregation
const debt_userId_to_objectid = (userId: string) => {
  const { Types } = require('mongoose');
  return new Types.ObjectId(userId);
};
