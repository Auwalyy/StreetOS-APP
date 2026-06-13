import mongoose, { Document } from 'mongoose';
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
    recommendedLoanRange: {
        min: number;
        max: number;
    };
    improvements: string[];
    calculatedAt: Date;
}
declare const _default: mongoose.Model<ICreditScore, {}, {}, {}, mongoose.Document<unknown, {}, ICreditScore, {}, {}> & ICreditScore & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=CreditScore.d.ts.map