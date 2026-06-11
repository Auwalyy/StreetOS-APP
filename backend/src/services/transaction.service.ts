import Transaction from '../models/Transaction';
import Inventory from '../models/Inventory';
import Customer from '../models/Customer';
import { AppError } from '../utils/appError';
import { processVoiceAudio } from './ai.service';
import { detectFraud } from './fraud.service';
import mongoose from 'mongoose';

export const createTransaction = async (userId: string, data: Record<string, unknown>) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const transaction = await Transaction.create([{ userId, ...data }], { session });
    const tx = transaction[0];

    // Update inventory if product involved
    if (tx.productName && tx.quantity) {
      const item = await Inventory.findOne({ userId, name: new RegExp(tx.productName as string, 'i') });
      if (item) {
        const delta = tx.type === 'sale' ? -(tx.quantity as number) : (tx.quantity as number);
        await Inventory.findByIdAndUpdate(item._id, { $inc: { quantity: delta } }, { session });
      }
    }

    // Update customer stats
    if (tx.customerId) {
      await Customer.findByIdAndUpdate(
        tx.customerId,
        {
          $inc: { totalPurchases: tx.amount, transactionCount: 1 },
          lastTransactionAt: new Date(),
        },
        { session }
      );
    }

    await session.commitTransaction();

    // Async fraud check (non-blocking)
    detectFraud(userId, String(tx._id)).catch(() => {});

    return tx;
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
};

export const createVoiceTransaction = async (
  userId: string,
  audioBuffer: Buffer,
  language: string,
  location?: { lat: number; lng: number }
) => {
  const extracted = await processVoiceAudio(audioBuffer, language);

  // Voice endpoint returns { type, data, transcript } — data holds the extracted fields
  const result = extracted?.type === 'transaction' ? extracted.data : null;
  if (!result || (result.confidence ?? 1) < 0.5) {
    throw new AppError('Could not understand the voice input. Please try again.', 422);
  }

  const txData = {
    type: result.transaction_type,
    amount: result.total_amount,
    quantity: result.quantity,
    unitPrice: result.unit_price,
    productName: result.product_name,
    customerName: result.customer_name,
    paymentMethod: result.payment_method || 'cash',
    voiceTranscript: extracted.transcript,
    source: 'voice',
    location: location ? { type: 'Point', coordinates: [location.lng, location.lat] } : undefined,
  };

  const tx = await createTransaction(userId, txData);
  return {
    transaction: {
      ...tx.toObject(),
      voiceTranscript: txData.voiceTranscript,
    },
    confidence: result.confidence ?? 0.9,
    inventoryUpdated: !!txData.productName,
  };
};

export const syncOfflineTransactions = async (userId: string, transactions: Record<string, unknown>[]) => {
  const results = [];
  for (const txData of transactions) {
    try {
      // Dedup check
      const existing = await Transaction.findOne({
        userId,
        amount: txData.amount,
        productName: txData.productName,
        createdAt: { $gte: new Date(Date.now() - 60000) },
      });
      if (existing) { results.push({ status: 'duplicate', id: txData.localId }); continue; }

      const tx = await createTransaction(userId, { ...txData, isOffline: true, syncedAt: new Date() });
      results.push({ status: 'synced', id: txData.localId, serverId: tx._id });
    } catch {
      results.push({ status: 'failed', id: txData.localId });
    }
  }
  return results;
};

export const getTransactions = async (
  userId: string,
  filters: Record<string, unknown>,
  page: number,
  limit: number
) => {
  const query: Record<string, unknown> = { userId };
  if (filters.type) query.type = filters.type;
  if (filters.from || filters.to) {
    query.createdAt = {};
    if (filters.from) (query.createdAt as Record<string, unknown>).$gte = new Date(filters.from as string);
    if (filters.to) (query.createdAt as Record<string, unknown>).$lte = new Date(filters.to as string);
  }
  if (filters.search) {
    query.$or = [
      { productName: new RegExp(filters.search as string, 'i') },
      { customerName: new RegExp(filters.search as string, 'i') },
    ];
  }

  const [data, total] = await Promise.all([
    Transaction.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Transaction.countDocuments(query),
  ]);

  return { data, total };
};

export const getTransactionSummary = async (userId: string, period: 'daily' | 'weekly' | 'monthly') => {
  const now = new Date();
  let from: Date;
  if (period === 'daily') {
    from = new Date(); from.setHours(0, 0, 0, 0);
  } else if (period === 'weekly') {
    from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  } else {
    from = new Date(now.getTime()); from.setMonth(from.getMonth() - 1);
  }

  const groups = await Transaction.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), createdAt: { $gte: from } } },
    { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 }, qty: { $sum: '$quantity' } } },
  ]);

  const revenue = groups.find((g) => g._id === 'sale')?.total || 0;
  const purchases = groups.find((g) => g._id === 'purchase')?.total || 0;
  const expenses = groups.find((g) => g._id === 'expense')?.total || 0;
  const salesCount = groups.find((g) => g._id === 'sale')?.count || 0;
  const itemsSold = groups.find((g) => g._id === 'sale')?.qty || 0;

  return {
    totalRevenue: revenue,
    totalProfit: revenue - purchases - expenses,
    salesCount,
    itemsSold,
    period,
    breakdown: groups,
  };
};
