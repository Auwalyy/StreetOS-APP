import Customer from '../models/Customer';
import { AppError } from '../utils/appError';

export const findOrCreateCustomer = async (userId: string, name: string, phone?: string) => {
  // Try exact name match first, then alias match
  let customer = await Customer.findOne({
    userId,
    $or: [
      { name: new RegExp(`^${name}$`, 'i') },
      { aliases: new RegExp(`^${name}$`, 'i') },
    ],
  });

  if (!customer) {
    customer = await Customer.create({ userId, name, phone, firstTransactionAt: new Date() });
  } else if (phone && !customer.phone) {
    customer.phone = phone;
    await customer.save();
  }

  return customer;
};

export const getCustomers = async (userId: string, page: number, limit: number, search?: string) => {
  const query: Record<string, unknown> = { userId };
  if (search) query.$or = [
    { name: new RegExp(search, 'i') },
    { phone: new RegExp(search, 'i') },
  ];

  const [data, total] = await Promise.all([
    Customer.find(query).sort({ lastTransactionAt: -1 }).skip((page - 1) * limit).limit(limit),
    Customer.countDocuments(query),
  ]);
  return { data, total };
};

export const getCustomerById = async (userId: string, customerId: string) => {
  const customer = await Customer.findOne({ _id: customerId, userId });
  if (!customer) throw new AppError('Customer not found', 404);
  return customer;
};

export const updateCustomerTrustScore = async (customerId: string) => {
  const customer = await Customer.findById(customerId);
  if (!customer) return;

  const repaymentScore = customer.debtRepaymentRate * 40;
  const volumeScore = Math.min(customer.totalPurchases / 100000, 1) * 30;
  const loyaltyScore = Math.min(customer.transactionCount / 50, 1) * 30;

  const trustScore = Math.round(repaymentScore + volumeScore + loyaltyScore);
  await Customer.findByIdAndUpdate(customerId, { trustScore });
};
