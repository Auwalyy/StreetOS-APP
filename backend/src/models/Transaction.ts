import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  type: 'sale' | 'purchase' | 'expense' | 'income' | 'transfer';
  amount: number;
  quantity?: number;
  unitPrice?: number;
  productId?: mongoose.Types.ObjectId;
  productName?: string;
  customerName?: string;
  customerId?: mongoose.Types.ObjectId;
  paymentMethod: string;
  notes?: string;
  voiceTranscript?: string;
  source: string;
  isOffline: boolean;
  syncedAt?: Date;
  receiptUrl?: string;
  fraudFlag: boolean;
  fraudReason?: string;
  location?: { type: string; coordinates: number[] };
  metadata?: Record<string, unknown>;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['sale', 'purchase', 'expense', 'income', 'transfer'],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    quantity: { type: Number, min: 0 },
    unitPrice: { type: Number, min: 0 },
    productId: { type: Schema.Types.ObjectId, ref: 'Inventory', sparse: true },
    productName: String,
    customerName: String,
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', sparse: true },
    paymentMethod: {
      type: String,
      enum: ['cash', 'transfer', 'credit', 'mobile_money'],
      default: 'cash',
    },
    notes: String,
    voiceTranscript: String,
    source: { type: String, enum: ['voice', 'manual', 'whatsapp', 'ussd'], default: 'manual' },
    isOffline: { type: Boolean, default: false },
    syncedAt: Date,
    receiptUrl: String,
    fraudFlag: { type: Boolean, default: false },
    fraudReason: String,
    location: {
      type: { type: String, default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

TransactionSchema.index({ userId: 1, createdAt: -1 });
TransactionSchema.index({ userId: 1, type: 1 });
TransactionSchema.index({ userId: 1, productName: 1 });

export default mongoose.model<ITransaction>('Transaction', TransactionSchema);
