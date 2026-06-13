import mongoose, { Document } from 'mongoose';
export interface IBusinessPassport extends Document {
    userId: mongoose.Types.ObjectId;
    passportId: string;
    businessName: string;
    ownerName: string;
    businessType: string;
    location: string;
    registeredAt: Date;
    healthScore: number;
    creditScore: number;
    trustScore: number;
    monthlyRevenue: {
        month: string;
        amount: number;
    }[];
    transactionVolume: number;
    verificationLevel: string;
    qrCode: string;
    shareableLink?: string;
    linkExpiresAt?: Date;
    pdfUrl?: string;
    isPublic: boolean;
    accessLog: {
        accessedBy: string;
        accessedAt: Date;
        purpose: string;
    }[];
}
declare const _default: mongoose.Model<IBusinessPassport, {}, {}, {}, mongoose.Document<unknown, {}, IBusinessPassport, {}, {}> & IBusinessPassport & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=BusinessPassport.d.ts.map