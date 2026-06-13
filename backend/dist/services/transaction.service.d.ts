import mongoose from 'mongoose';
export declare const createTransaction: (userId: string, data: Record<string, unknown>) => Promise<mongoose.Document<unknown, {}, import("../models/Transaction").ITransaction, {}, {}> & import("../models/Transaction").ITransaction & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const createVoiceTransaction: (userId: string, audioBuffer: Buffer, language: string, location?: {
    lat: number;
    lng: number;
}) => Promise<{
    transaction: {
        voiceTranscript: any;
        userId: mongoose.Types.ObjectId;
        type: "sale" | "purchase" | "expense" | "income" | "transfer";
        amount: number;
        quantity?: number;
        unitPrice?: number;
        productId?: mongoose.Types.ObjectId;
        productName?: string;
        customerName?: string;
        customerId?: mongoose.Types.ObjectId;
        paymentMethod: string;
        notes?: string;
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
        _id: mongoose.Types.ObjectId;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: mongoose.Collection;
        db: mongoose.Connection;
        errors?: mongoose.Error.ValidationError;
        id?: any;
        isNew: boolean;
        schema: mongoose.Schema;
        __v: number;
    };
    confidence: any;
    inventoryUpdated: boolean;
}>;
export declare const syncOfflineTransactions: (userId: string, transactions: Record<string, unknown>[]) => Promise<({
    status: string;
    id: unknown;
    serverId?: undefined;
} | {
    status: string;
    id: unknown;
    serverId: mongoose.Types.ObjectId;
})[]>;
export declare const getTransactions: (userId: string, filters: Record<string, unknown>, page: number, limit: number) => Promise<{
    data: (mongoose.Document<unknown, {}, import("../models/Transaction").ITransaction, {}, {}> & import("../models/Transaction").ITransaction & Required<{
        _id: mongoose.Types.ObjectId;
    }> & {
        __v: number;
    })[];
    total: number;
}>;
export declare const getTransactionSummary: (userId: string, period: "daily" | "weekly" | "monthly") => Promise<{
    totalRevenue: any;
    totalProfit: number;
    salesCount: any;
    itemsSold: any;
    period: "daily" | "weekly" | "monthly";
    breakdown: any[];
}>;
//# sourceMappingURL=transaction.service.d.ts.map