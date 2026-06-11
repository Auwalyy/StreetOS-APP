import mongoose, { Schema, Document } from 'mongoose';

export interface IHealthScore extends Document {
  userId: mongoose.Types.ObjectId;
  score: number;
  band: string;
  components: {
    revenueConsistency: number;
    inventoryManagement: number;
    debtCollection: number;
    customerRetention: number;
    businessGrowth: number;
  };
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  narrative: string;
  calculatedAt: Date;
}

const HealthScoreSchema = new Schema<IHealthScore>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    band: {
      type: String,
      enum: ['excellent', 'good', 'fair', 'needs_improvement', 'critical'],
      required: true,
    },
    components: {
      revenueConsistency: { type: Number, default: 0 },
      inventoryManagement: { type: Number, default: 0 },
      debtCollection: { type: Number, default: 0 },
      customerRetention: { type: Number, default: 0 },
      businessGrowth: { type: Number, default: 0 },
    },
    strengths: [String],
    weaknesses: [String],
    recommendations: [String],
    narrative: String,
    calculatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

HealthScoreSchema.index({ userId: 1, calculatedAt: -1 });

export default mongoose.model<IHealthScore>('HealthScore', HealthScoreSchema);
