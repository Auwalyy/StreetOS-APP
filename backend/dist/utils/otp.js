"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashToken = exports.verifyOTP = exports.storeOTP = exports.generateOTP = void 0;
const crypto_1 = __importDefault(require("crypto"));
const redis_1 = __importDefault(require("../config/redis"));
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};
exports.generateOTP = generateOTP;
const storeOTP = async (phone, otp) => {
    const key = `otp:${phone}`;
    await redis_1.default.set(key, otp, { EX: 300 }); // 5 minutes TTL
};
exports.storeOTP = storeOTP;
const verifyOTP = async (phone, otp) => {
    const key = `otp:${phone}`;
    const stored = await redis_1.default.get(key);
    if (!stored || stored !== otp)
        return false;
    await redis_1.default.del(key);
    return true;
};
exports.verifyOTP = verifyOTP;
const hashToken = (token) => {
    return crypto_1.default.createHash('sha256').update(token).digest('hex');
};
exports.hashToken = hashToken;
//# sourceMappingURL=otp.js.map