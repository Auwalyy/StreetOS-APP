"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logoutUser = exports.refreshTokens = exports.verifyUserOTP = exports.loginUser = exports.registerUser = void 0;
const User_1 = __importDefault(require("../models/User"));
const jwt_1 = require("../utils/jwt");
const otp_1 = require("../utils/otp");
const appError_1 = require("../utils/appError");
const registerUser = async (data) => {
    const exists = await User_1.default.findOne({ phone: data.phone });
    if (exists)
        throw new appError_1.AppError('Phone number already registered', 409);
    const user = await User_1.default.create({ ...data, passwordHash: data.password, isVerified: true });
    return { userId: user._id };
};
exports.registerUser = registerUser;
const loginUser = async (phone, password) => {
    const user = await User_1.default.findOne({ phone }).select('+passwordHash');
    if (!user || !(await user.comparePassword(password))) {
        throw new appError_1.AppError('Invalid phone or password', 401);
    }
    if (!user.isActive)
        throw new appError_1.AppError('Account suspended', 403);
    const accessToken = (0, jwt_1.generateAccessToken)(String(user._id), user.role);
    const refreshToken = (0, jwt_1.generateRefreshToken)(String(user._id));
    await User_1.default.findByIdAndUpdate(user._id, {
        lastLoginAt: new Date(),
        $push: { refreshTokens: (0, otp_1.hashToken)(refreshToken) },
    });
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
    await User_1.default.findByIdAndUpdate(user._id, { $push: { refreshTokens: (0, otp_1.hashToken)(refreshToken) } });
    return { accessToken, refreshToken, user: { id: user._id, firstName: user.firstName, role: user.role } };
};
exports.verifyUserOTP = verifyUserOTP;
const refreshTokens = async (token) => {
    const payload = (0, jwt_1.verifyRefreshToken)(token);
    const hashed = (0, otp_1.hashToken)(token);
    const user = await User_1.default.findOne({ _id: payload.sub, refreshTokens: hashed }).select('+refreshTokens');
    if (!user || !user.isActive)
        throw new appError_1.AppError('Invalid refresh token', 401);
    const newAccessToken = (0, jwt_1.generateAccessToken)(String(user._id), user.role);
    const newRefreshToken = (0, jwt_1.generateRefreshToken)(String(user._id));
    await User_1.default.findByIdAndUpdate(user._id, {
        $pull: { refreshTokens: hashed },
        $push: { refreshTokens: (0, otp_1.hashToken)(newRefreshToken) },
    });
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};
exports.refreshTokens = refreshTokens;
const logoutUser = async (refreshToken) => {
    await User_1.default.findOneAndUpdate({ refreshTokens: (0, otp_1.hashToken)(refreshToken) }, { $pull: { refreshTokens: (0, otp_1.hashToken)(refreshToken) } });
};
exports.logoutUser = logoutUser;
//# sourceMappingURL=auth.service.js.map