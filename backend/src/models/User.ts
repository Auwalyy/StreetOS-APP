import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

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
    coordinates: { type: string; coordinates: number[] };
  };
  profileImage?: string;
  isVerified: boolean;
  isActive: boolean;
  kycStatus: string;
  kycDocuments: { type: string; url: string; verifiedAt?: Date }[];
  fcmToken?: string;
  whatsappNumber?: string;
  businessRegisteredAt?: Date;
  lastLoginAt?: Date;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    phone: { type: String, required: true, unique: true, index: true },
    email: { type: String, unique: true, sparse: true, lowercase: true },
    passwordHash: { type: String, required: true, select: false },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    businessName: { type: String, trim: true },
    businessType: {
      type: String,
      enum: ['trader', 'artisan', 'food_vendor', 'transport', 'other'],
      default: 'trader',
    },
    role: {
      type: String,
      enum: ['trader', 'artisan', 'business_owner', 'loan_officer', 'fintech_partner', 'admin', 'super_admin'],
      default: 'trader',
    },
    language: { type: String, enum: ['en', 'ha', 'yo', 'ig', 'pcm'], default: 'en' },
    location: {
      state: String,
      lga: String,
      coordinates: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], default: [0, 0] },
      },
    },
    profileImage: String,
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    kycStatus: { type: String, enum: ['none', 'pending', 'verified', 'rejected'], default: 'none' },
    kycDocuments: [{ type: { type: String }, url: String, verifiedAt: Date }],
    fcmToken: String,
    whatsappNumber: String,
    businessRegisteredAt: Date,
    lastLoginAt: Date,
  },
  { timestamps: true }
);

UserSchema.index({ 'location.coordinates': '2dsphere' });

UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.passwordHash);
};

UserSchema.pre('save', async function (next) {
  if (this.isModified('passwordHash')) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  }
  next();
});

export default mongoose.model<IUser>('User', UserSchema);
