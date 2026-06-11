import mongoose, { Schema, Document } from 'mongoose';

export interface ICreditScore extends Document {
  userId: mongoose.Types.ObjectId;
  score: number;
  components: {
    transactionConsistency: number;
    revenueLevel: number;
    debtRepaymentBehavior: number;
    businessAge: number;
    identityVerification: number;
  };
  loanEligibility: 'eligible' | 'conditional' | 'ineligible';
  recommendedLoanRange: { min: number; max: number };
  improvements: string[];
  calculatedAt: Date;
}

const CreditScoreSchema = new Schema<ICreditScore>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    score: { type: Number, required: true, min: 300, max: 850 },
    components: {
      transactionConsistency: { type: Number, default: 0 },
      revenueLevel: { type: Number, default: 0 },
      debtRepaymentBehavior: { type: Number, default: 0 },
      businessAge: { type: Number, default: 0 },
      identityVerification: { type: Number, default: 0 },
    },
    loanEligibility: {
      type: String,
      enum: ['eligible', 'conditional', 'ineligible'],
      required: true,
    },
    recommendedLoanRange: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
    },
    improvements: [String],
    calculatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

CreditScoreSchema.index({ userId: 1, calculatedAt: -1 });

export default mongoose.model<ICreditScore>('CreditScore', CreditScoreSchema);
