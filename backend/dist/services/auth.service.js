"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutUser = exports.refreshTokens = exports.verifyUserOTP = exports.loginUser = exports.registerUser = void 0;
const User_1 = __importDefault(require("../models/User"));
const redis_1 = __importDefault(require("../config/redis"));
const jwt_1 = require("../utils/jwt");
const otp_1 = require("../utils/otp");
const notification_service_1 = require("./notification.service");
const appError_1 = require("../utils/appError");
const registerUser = async (data) => {
    const exists = await User_1.default.findOne({ phone: data.phone });
    if (exists)
        throw new appError_1.AppError('Phone number already registered', 409);
    const user = await User_1.default.create({ ...data, passwordHash: data.password });
    const otp = (0, otp_1.generateOTP)();
    await (0, otp_1.storeOTP)(data.phone, otp);
    await (0, notification_service_1.sendSMS)(data.phone, `Your StreetOS verification code is: ${otp}. Expires in 5 minutes.`);
    return { userId: user._id, otpExpiry: new Date(Date.now() + 5 * 60 * 1000) };
};
exports.registerUser = registerUser;
const loginUser = async (phone, password) => {
    const user = await User_1.default.findOne({ phone }).select('+passwordHash');
    if (!user || !(await user.comparePassword(password))) {
        throw new appError_1.AppError('Invalid phone or password', 401);
    }
    if (!user.isVerified)
        throw new appError_1.AppError('Please verify your phone number', 403);
    if (!user.isActive)
        throw new appError_1.AppError('Account suspended', 403);
    const accessToken = (0, jwt_1.generateAccessToken)(String(user._id), user.role);
    const refreshToken = (0, jwt_1.generateRefreshToken)(String(user._id));
    await redis_1.default.set(`refresh:${(0, otp_1.hashToken)(refreshToken)}`, String(user._id), { EX: 30 * 24 * 60 * 60 });
    await User_1.default.findByIdAndUpdate(user._id, { lastLoginAt: new Date() });
    return {
        accessToken,
        refreshToken,
        user: { id: user._id, firstName: user.firstName, lastName: user.lastName, role: user.role, language: user.language },
    };
};
exports.loginUser = loginUser;
const verifyUserOTP = async (phone, otp) => {
    const valid = await (0, otp_1.verifyOTP)(phone, otp);
    if (!valid)
        throw new appError_1.AppError('Invalid or expired OTP', 400);
    const user = await User_1.default.findOneAndUpdate({ phone }, { isVerified: true }, { new: true });
    if (!user)
        throw new appError_1.AppError('User not found', 404);
    const accessToken = (0, jwt_1.generateAccessToken)(String(user._id), user.role);
    const refreshToken = (0, jwt_1.generateRefreshToken)(String(user._id));
    await redis_1.default.set(`refresh:${(0, otp_1.hashToken)(refreshToken)}`, String(user._id), { EX: 30 * 24 * 60 * 60 });
    return { accessToken, refreshToken, user: { id: user._id, firstName: user.firstName, role: user.role } };
};
exports.verifyUserOTP = verifyUserOTP;
const refreshTokens = async (token) => {
    const payload = (0, jwt_1.verifyRefreshToken)(token);
    const key = `refresh:${(0, otp_1.hashToken)(token)}`;
    const userId = await redis_1.default.get(key);
    if (!userId || userId !== payload.sub)
        throw new appError_1.AppError('Invalid refresh token', 401);
    await redis_1.default.del(key);
    const user = await User_1.default.findById(payload.sub);
    if (!user || !user.isActive)
        throw new appError_1.AppError('User not found', 401);
    const newAccessToken = (0, jwt_1.generateAccessToken)(String(user._id), user.role);
    const newRefreshToken = (0, jwt_1.generateRefreshToken)(String(user._id));
    await redis_1.default.set(`refresh:${(0, otp_1.hashToken)(newRefreshToken)}`, String(user._id), { EX: 30 * 24 * 60 * 60 });
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};
exports.refreshTokens = refreshTokens;
const logoutUser = async (refreshToken) => {
    await redis_1.default.del(`refresh:${(0, otp_1.hashToken)(refreshToken)}`);
};
exports.logoutUser = logoutUser;
//# sourceMappingURL=auth.service.js.map