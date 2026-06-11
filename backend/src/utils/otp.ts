import crypto from 'crypto';
import redisClient from '../config/redis';

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const storeOTP = async (phone: string, otp: string): Promise<void> => {
  const key = `otp:${phone}`;
  await redisClient.set(key, otp, { EX: 300 }); // 5 minutes TTL
};

export const verifyOTP = async (phone: string, otp: string): Promise<boolean> => {
  const key = `otp:${phone}`;
  const stored = await redisClient.get(key);
  if (!stored || stored !== otp) return false;
  await redisClient.del(key);
  return true;
};

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
