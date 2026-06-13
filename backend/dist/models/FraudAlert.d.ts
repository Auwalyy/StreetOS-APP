import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IFraudAlert, {}, {}, {}, mongoose.Document<unknown, {}, IFraudAlert, {}, {}> & IFraudAlert & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=FraudAlert.d.ts.map