import mongoose, { Document } from 'mongoose';
export interface ICustomer extends Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    phone?: string;
    aliases: string[];
    location?: string;
    totalPurchases: number;
    totalDebt: number;
    debtRepaymentRate: number;
    trustScore: number;
    transactionCount: number;
    firstTransactionAt?: Date;
    lastTransactionAt?: Date;
    notes?: string;
    isBlocked: boolean;
}
declare const _default: mongoose.Model<ICustomer, {}, {}, {}, mongoose.Document<unknown, {}, ICustomer, {}, {}> & ICustomer & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Customer.d.ts.map