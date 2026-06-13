import mongoose from 'mongoose';
export declare const runCreditScoreForUser: (userId: string) => Promise<mongoose.Document<unknown, {}, import("../models/CreditScore").ICreditScore, {}, {}> & import("../models/CreditScore").ICreditScore & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const runCreditScoreJob: () => Promise<void>;
//# sourceMappingURL=creditScore.job.d.ts.map