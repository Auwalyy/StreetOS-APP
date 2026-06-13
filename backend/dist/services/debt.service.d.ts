export declare const createDebt: (userId: string, data: {
    customerName: string;
    amount: number;
    dueDate: Date;
    productName?: string;
    notes?: string;
    source?: string;
    phone?: string;
}) => Promise<import("mongoose").Document<unknown, {}, import("../models/Debt").IDebt, {}, {}> & import("../models/Debt").IDebt & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}>;
export declare const recordPayment: (userId: string, debtId: string, amount: number, method?: string) => Promise<(import("mongoose").Document<unknown, {}, import("../models/Debt").IDebt, {}, {}> & import("../models/Debt").IDebt & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}) | null>;
export declare const getDebtSummary: (userId: string) => Promise<any[]>;
//# sourceMappingURL=debt.service.d.ts.map