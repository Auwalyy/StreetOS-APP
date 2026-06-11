import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  phone?: string;
  aliases: string[];
  location?: string;
  totalPurchases: number;
  totalDebt: number;
  debtRepaymentRate: number;
  trustScore: number;
  transactionCount: number;
  firstTransactionAt?: Date;
  lastTransactionAt?: Date;
  notes?: string;
  isBlocked: boolean;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: String,
    aliases: [String],
    location: String,
    totalPurchases: { type: Number, default: 0 },
    totalDebt: { type: Number, default: 0 },
    debtRepaymentRate: { type: Number, default: 0, min: 0, max: 1 },
    trustScore: { type: Number, default: 50, min: 0, max: 100 },
    transactionCount: { type: Number, default: 0 },
    firstTransactionAt: Date,
    lastTransactionAt: Date,
    notes: String,
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CustomerSchema.index({ userId: 1, name: 1 });
CustomerSchema.index({ userId: 1, phone: 1 });

export default mongoose.model<ICustomer>('Customer', CustomerSchema);
