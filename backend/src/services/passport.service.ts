import BusinessPassport from '../models/BusinessPassport';
import User from '../models/User';
import HealthScore from '../models/HealthScore';
import CreditScore from '../models/CreditScore';
import { getRevenueTrend } from './analytics.service';
import { AppError } from '../utils/appError';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import cloudinary from '../config/cloudinary';

export const getOrCreatePassport = async (userId: string) => {
  let passport = await BusinessPassport.findOne({ userId });
  if (!passport) {
    passport = await generatePassport(userId);
  }
  return passport;
};

export const generatePassport = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  const [healthScore, creditScore, revenueTrend] = await Promise.all([
    HealthScore.findOne({ userId }).sort({ calculatedAt: -1 }),
    CreditScore.findOne({ userId }).sort({ calculatedAt: -1 }),
    getRevenueTrend(userId),
  ]);

  const passportId = `BOS-${uuidv4().substring(0, 8).toUpperCase()}`;
  const qrData = JSON.stringify({ passportId, userId, verifiedAt: new Date().toISOString() });
  const qrCode = await QRCode.toDataURL(qrData);

  return BusinessPassport.findOneAndUpdate(
    { userId },
    {
      userId,
      passportId,
      businessName: user.businessName || `${user.firstName}'s Business`,
      ownerName: `${user.firstName} ${user.lastName}`,
      businessType: user.businessType,
      location: user.location?.state || '',
      registeredAt: user.businessRegisteredAt || user.createdAt,
      healthScore: healthScore?.score || 0,
      creditScore: creditScore?.score || 300,
      trustScore: 50,
      monthlyRevenue: revenueTrend.map((r: { _id: string; revenue: number }) => ({ month: r._id, amount: r.revenue })),
      verificationLevel: user.kycStatus === 'verified' ? 'verified' : 'basic',
      qrCode,
    },
    { upsert: true, new: true }
  );
};

export const generateShareableLink = async (userId: string) => {
  const passport = await BusinessPassport.findOne({ userId });
  if (!passport) throw new AppError('Passport not found', 404);

  const link = `https://passport.streetos.ai/verify/${passport.passportId}`;
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await BusinessPassport.findOneAndUpdate({ userId }, { shareableLink: link, linkExpiresAt: expiresAt });
  return { link, expiresAt };
};
