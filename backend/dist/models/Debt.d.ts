import mongoose, { Document } from 'mongoose';
export interface IDebt extends Document {
    userId: mongoose.Types.ObjectId;
    customerId: mongoose.Types.ObjectId;
    customerName: string;
    amount: number;
    amountPaid: number;
    balance: number;
    dueDate: Date;
    status: 'pending' | 'partial' | 'settled' | 'overdue' | 'disputed';
    productName?: string;
    notes?: string;
    reminders: {
        sentAt: Date;
        channel: string;
        status: string;
    }[];
    payments: {
        amount: number;
        paidAt: Date;
        method: string;
        notes?: string;
    }[];
    source: string;
}
declare const _default: mongoose.Model<IDebt, {}, {}, {}, mongoose.Document<unknown, {}, IDebt, {}, {}> & IDebt & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Debt.d.ts.map