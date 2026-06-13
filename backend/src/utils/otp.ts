import crypto from 'crypto';

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// In-memory OTP store: phone -> { otp, expiresAt }
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

export const storeOTP = async (phone: string, otp: string): Promise<void> => {
  otpStore.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });
};

export const verifyOTP = async (phone: string, otp: string): Promise<boolean> => {
  const entry = otpStore.get(phone);
  if (!entry || entry.otp !== otp || Date.now() > entry.expiresAt) return false;
  otpStore.delete(phone);
  return true;
};

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
