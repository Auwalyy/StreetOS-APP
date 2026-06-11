import Transaction from '../models/Transaction';
import Inventory from '../models/Inventory';
import Customer from '../models/Customer';
import { AppError } from '../utils/appError';
import { callAIService } from './ai.service';
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
  const extracted = await callAIService('/voice/process', { audioBuffer, language });
  if (!extracted || extracted.confidence < 0.5) {
    throw new AppError('Could not understand the voice input. Please try again.', 422);
  }

  const txData = {
    type: extracted.transaction_type,
    amount: extracted.total_amount,
    quantity: extracted.quantity,
    unitPrice: extracted.unit_price,
    productName: extracted.product_name,
    customerName: extracted.customer_name,
    paymentMethod: extracted.payment_method || 'cash',
    voiceTranscript: extracted.transcript,
    source: 'voice',
    location: location ? { type: 'Point', coordinates: [location.lng, location.lat] } : undefined,
  };

  const tx = await createTransaction(userId, txData);
  return { transaction: tx, confidence: extracted.confidence };
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
  if (period === 'daily') from = new Date(now.setHours(0, 0, 0, 0));
  else if (period === 'weekly') from = new Date(now.setDate(now.getDate() - 7));
  else from = new Date(now.setMonth(now.getMonth() - 1));

  const summary = await Transaction.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), createdAt: { $gte: from } } },
    { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
  ]);

  return summary;
};
