import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IHealthScore, {}, {}, {}, mongoose.Document<unknown, {}, IHealthScore, {}, {}> & IHealthScore & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=HealthScore.d.ts.map