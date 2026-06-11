import mongoose, { Schema, Document } from 'mongoose';

export interface IMarketIntelligence extends Document {
  region: string;
  productCategory: string;
  productName: string;
  averagePrice: number;
  priceChange: number;
  priceChangeDirection: 'up' | 'down' | 'stable';
  sampleSize: number;
  period: string;
  insights: string[];
}

const MarketIntelligenceSchema = new Schema<IMarketIntelligence>(
  {
    region: { type: String, required: true, index: true },
    productCategory: { type: String, required: true },
    productName: { type: String, required: true },
    averagePrice: { type: Number, required: true },
    priceChange: { type: Number, default: 0 },
    priceChangeDirection: { type: String, enum: ['up', 'down', 'stable'], default: 'stable' },
    sampleSize: { type: Number, default: 0 },
    period: { type: String, required: true },
    insights: [String],
  },
  { timestamps: true }
);

MarketIntelligenceSchema.index({ region: 1, productName: 1, period: 1 });

export default mongoose.model<IMarketIntelligence>('MarketIntelligence', MarketIntelligenceSchema);
