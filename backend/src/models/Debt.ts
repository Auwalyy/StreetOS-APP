import mongoose, { Schema, Document } from 'mongoose';

export interface IDebt extends Document {
  userId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  customerName: string;
  amount: number;
  amountPaid: number;
  balance: number;
  dueDate: Date;
  status: 'pending' | 'partial' | 'settled' | 'overdue' | 'disputed';
  productName?: string;
  notes?: string;
  reminders: { sentAt: Date; channel: string; status: string }[];
  payments: { amount: number; paidAt: Date; method: string; notes?: string }[];
  source: string;
}

const DebtSchema = new Schema<IDebt>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    customerName: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    amountPaid: { type: Number, default: 0, min: 0 },
    balance: { type: Number, required: true, min: 0 },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending', 'partial', 'settled', 'overdue', 'disputed'],
      default: 'pending',
    },
    productName: String,
    notes: String,
    reminders: [
      {
        sentAt: Date,
        channel: { type: String, enum: ['whatsapp', 'sms', 'push'] },
        status: { type: String, enum: ['sent', 'delivered', 'failed'] },
      },
    ],
    payments: [
      {
        amount: { type: Number, required: true },
        paidAt: { type: Date, default: Date.now },
        method: String,
        notes: String,
      },
    ],
    source: { type: String, enum: ['voice', 'manual', 'whatsapp'], default: 'manual' },
  },
  { timestamps: true }
);

DebtSchema.index({ userId: 1, status: 1 });
DebtSchema.index({ dueDate: 1, status: 1 });
DebtSchema.index({ userId: 1, customerId: 1 });

export default mongoose.model<IDebt>('Debt', DebtSchema);
