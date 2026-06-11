import mongoose, { Schema, Document } from 'mongoose';

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
  monthlyRevenue: { month: string; amount: number }[];
  transactionVolume: number;
  verificationLevel: string;
  qrCode: string;
  shareableLink?: string;
  linkExpiresAt?: Date;
  pdfUrl?: string;
  isPublic: boolean;
  accessLog: { accessedBy: string; accessedAt: Date; purpose: string }[];
}

const BusinessPassportSchema = new Schema<IBusinessPassport>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    passportId: { type: String, required: true, unique: true },
    businessName: { type: String, required: true },
    ownerName: { type: String, required: true },
    businessType: String,
    location: String,
    registeredAt: Date,
    healthScore: { type: Number, default: 0 },
    creditScore: { type: Number, default: 300 },
    trustScore: { type: Number, default: 50 },
    monthlyRevenue: [{ month: String, amount: Number }],
    transactionVolume: { type: Number, default: 0 },
    verificationLevel: {
      type: String,
      enum: ['basic', 'standard', 'verified'],
      default: 'basic',
    },
    qrCode: String,
    shareableLink: String,
    linkExpiresAt: Date,
    pdfUrl: String,
    isPublic: { type: Boolean, default: false },
    accessLog: [
      {
        accessedBy: String,
        accessedAt: { type: Date, default: Date.now },
        purpose: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<IBusinessPassport>('BusinessPassport', BusinessPassportSchema);
