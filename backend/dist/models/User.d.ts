import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    phone: string;
    email?: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    businessName?: string;
    businessType: string;
    role: string;
    language: string;
    location: {
        state?: string;
        lga?: string;
        coordinates: {
            type: string;
            coordinates: number[];
        };
    };
    profileImage?: string;
    isVerified: boolean;
    isActive: boolean;
    kycStatus: string;
    kycDocuments: {
        type: string;
        url: string;
        verifiedAt?: Date;
    }[];
    fcmToken?: string;
    whatsappNumber?: string;
    refreshTokens: string[];
    businessRegisteredAt?: Date;
    lastLoginAt?: Date;
    createdAt?: Date;
    comparePassword(password: string): Promise<boolean>;
}
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=User.d.ts.map