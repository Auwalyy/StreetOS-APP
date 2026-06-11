import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { sendSuccess } from '../utils/response';

export const register = async (req: Request, res: Response) => {
  const result = await authService.registerUser(req.body);
  sendSuccess(res, result, 'OTP sent to your phone number', 201);
};

export const login = async (req: Request, res: Response) => {
  const { phone, password } = req.body;
  const result = await authService.loginUser(phone, password);
  sendSuccess(res, result, 'Login successful');
};

export const verifyOTP = async (req: Request, res: Response) => {
  const { phone, otp } = req.body;
  const result = await authService.verifyUserOTP(phone, otp);
  sendSuccess(res, result, 'Phone verified successfully');
};

export const resendOTP = async (req: Request, res: Response) => {
  const { phone } = req.body;
  await authService.registerUser({ ...req.body, phone }); // reuses OTP logic
  sendSuccess(res, null, 'OTP resent');
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  const tokens = await authService.refreshTokens(refreshToken);
  sendSuccess(res, tokens, 'Tokens refreshed');
};

export const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  await authService.logoutUser(refreshToken);
  sendSuccess(res, null, 'Logged out successfully');
};

export const getMe = async (req: Request, res: Response) => {
  sendSuccess(res, req.user, 'User profile');
};

export const updateFCMToken = async (req: Request, res: Response) => {
  const { fcmToken } = req.body;
  if (!fcmToken) { res.status(400).json({ success: false, message: 'fcmToken required' }); return; }
  await (await import('../models/User')).default.findByIdAndUpdate(req.user!._id, { fcmToken });
  sendSuccess(res, null, 'FCM token updated');
};
