import mongoose, { Schema, Document } from 'mongoose';

export interface IFraudAlert extends Document {
  userId: mongoose.Types.ObjectId;
  transactionId?: mongoose.Types.ObjectId;
  alertType: string;
  severity: string;
  description: string;
  resolved: boolean;
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
}

const FraudAlertSchema = new Schema<IFraudAlert>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction', sparse: true },
    alertType: {
      type: String,
      enum: ['unusual_amount', 'rapid_transactions', 'inventory_mismatch', 'fake_debt'],
      required: true,
    },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
    description: { type: String, required: true },
    resolved: { type: Boolean, default: false },
    resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: Date,
  },
  { timestamps: true }
);

FraudAlertSchema.index({ resolved: 1, severity: 1 });

export default mongoose.model<IFraudAlert>('FraudAlert', FraudAlertSchema);
