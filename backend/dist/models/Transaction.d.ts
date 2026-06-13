import mongoose, { Document } from 'mongoose';
export interface ITransaction extends Document {
    userId: mongoose.Types.ObjectId;
    type: 'sale' | 'purchase' | 'expense' | 'income' | 'transfer';
    amount: number;
    quantity?: number;
    unitPrice?: number;
    productId?: mongoose.Types.ObjectId;
    productName?: string;
    customerName?: string;
    customerId?: mongoose.Types.ObjectId;
    paymentMethod: string;
    notes?: string;
    voiceTranscript?: string;
    source: string;
    isOffline: boolean;
    syncedAt?: Date;
    receiptUrl?: string;
    fraudFlag: boolean;
    fraudReason?: string;
    location?: {
        type: string;
        coordinates: number[];
    };
    metadata?: Record<string, unknown>;
}
declare const _default: mongoose.Model<ITransaction, {}, {}, {}, mongoose.Document<unknown, {}, ITransaction, {}, {}> & ITransaction & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Transaction.d.ts.map