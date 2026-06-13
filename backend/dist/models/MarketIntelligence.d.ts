import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IMarketIntelligence, {}, {}, {}, mongoose.Document<unknown, {}, IMarketIntelligence, {}, {}> & IMarketIntelligence & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=MarketIntelligence.d.ts.map