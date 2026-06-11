import User from '../models/User';
import redisClient from '../config/redis';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { generateOTP, storeOTP, verifyOTP, hashToken } from '../utils/otp';
import { sendSMS } from './notification.service';
import { AppError } from '../utils/appError';

export const registerUser = async (data: {
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  businessName?: string;
  businessType?: string;
  language?: string;
}) => {
  const exists = await User.findOne({ phone: data.phone });
  if (exists) throw new AppError('Phone number already registered', 409);

  const user = await User.create({ ...data, passwordHash: data.password });
  const otp = generateOTP();
  await storeOTP(data.phone, otp);
  await sendSMS(data.phone, `Your StreetOS verification code is: ${otp}. Expires in 5 minutes.`);

  return { userId: user._id, otpExpiry: new Date(Date.now() + 5 * 60 * 1000) };
};

export const loginUser = async (phone: string, password: string) => {
  const user = await User.findOne({ phone }).select('+passwordHash');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid phone or password', 401);
  }
  if (!user.isVerified) throw new AppError('Please verify your phone number', 403);
  if (!user.isActive) throw new AppError('Account suspended', 403);

  const accessToken = generateAccessToken(String(user._id), user.role);
  const refreshToken = generateRefreshToken(String(user._id));

  await redisClient.set(`refresh:${hashToken(refreshToken)}`, String(user._id), { EX: 30 * 24 * 60 * 60 });

  await User.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });

  return {
    accessToken,
    refreshToken,
    user: { id: user._id, firstName: user.firstName, lastName: user.lastName, role: user.role, language: user.language },
  };
};

export const verifyUserOTP = async (phone: string, otp: string) => {
  const valid = await verifyOTP(phone, otp);
  if (!valid) throw new AppError('Invalid or expired OTP', 400);

  const user = await User.findOneAndUpdate({ phone }, { isVerified: true }, { new: true });
  if (!user) throw new AppError('User not found', 404);

  const accessToken = generateAccessToken(String(user._id), user.role);
  const refreshToken = generateRefreshToken(String(user._id));
  await redisClient.set(`refresh:${hashToken(refreshToken)}`, String(user._id), { EX: 30 * 24 * 60 * 60 });

  return { accessToken, refreshToken, user: { id: user._id, firstName: user.firstName, role: user.role } };
};

export const refreshTokens = async (token: string) => {
  const payload = verifyRefreshToken(token);
  const key = `refresh:${hashToken(token)}`;
  const userId = await redisClient.get(key);
  if (!userId || userId !== payload.sub) throw new AppError('Invalid refresh token', 401);

  await redisClient.del(key);

  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) throw new AppError('User not found', 401);

  const newAccessToken = generateAccessToken(String(user._id), user.role);
  const newRefreshToken = generateRefreshToken(String(user._id));
  await redisClient.set(`refresh:${hashToken(newRefreshToken)}`, String(user._id), { EX: 30 * 24 * 60 * 60 });

  return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const logoutUser = async (refreshToken: string) => {
  await redisClient.del(`refresh:${hashToken(refreshToken)}`);
};
