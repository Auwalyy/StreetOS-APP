"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashToken = exports.verifyOTP = exports.storeOTP = exports.generateOTP = void 0;
const crypto_1 = __importDefault(require("crypto"));
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
exports.generateOTP = generateOTP;
// In-memory OTP store: phone -> { otp, expiresAt }
const otpStore = new Map();
const storeOTP = async (phone, otp) => {
    otpStore.set(phone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });
};
exports.storeOTP = storeOTP;
const verifyOTP = async (phone, otp) => {
    const entry = otpStore.get(phone);
    if (!entry || entry.otp !== otp || Date.now() > entry.expiresAt)
        return false;
    otpStore.delete(phone);
    return true;
};
exports.verifyOTP = verifyOTP;
const hashToken = (token) => {
    return crypto_1.default.createHash('sha256').update(token).digest('hex');
};
exports.hashToken = hashToken;
//# sourceMappingURL=otp.js.map