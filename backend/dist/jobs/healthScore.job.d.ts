import mongoose from 'mongoose';
export declare const runHealthScoreForUser: (userId: string) => Promise<mongoose.Document<unknown, {}, import("../models/HealthScore").IHealthScore, {}, {}> & import("../models/HealthScore").IHealthScore & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const runHealthScoreJob: () => Promise<void>;
//# sourceMappingURL=healthScore.job.d.ts.map