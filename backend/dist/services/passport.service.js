"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateShareableLink = exports.generatePassport = exports.getOrCreatePassport = void 0;
const BusinessPassport_1 = __importDefault(require("../models/BusinessPassport"));
const User_1 = __importDefault(require("../models/User"));
const HealthScore_1 = __importDefault(require("../models/HealthScore"));
const CreditScore_1 = __importDefault(require("../models/CreditScore"));
const analytics_service_1 = require("./analytics.service");
const appError_1 = require("../utils/appError");
const qrcode_1 = __importDefault(require("qrcode"));
const uuid_1 = require("uuid");
const getOrCreatePassport = async (userId) => {
    let passport = await BusinessPassport_1.default.findOne({ userId });
    if (!passport) {
        passport = await (0, exports.generatePassport)(userId);
    }
    return passport;
};
exports.getOrCreatePassport = getOrCreatePassport;
const generatePassport = async (userId) => {
    const user = await User_1.default.findById(userId);
    if (!user)
        throw new appError_1.AppError('User not found', 404);
    const [healthScore, creditScore, revenueTrend] = await Promise.all([
        HealthScore_1.default.findOne({ userId }).sort({ calculatedAt: -1 }),
        CreditScore_1.default.findOne({ userId }).sort({ calculatedAt: -1 }),
        (0, analytics_service_1.getRevenueTrend)(userId),
    ]);
    const passportId = `BOS-${(0, uuid_1.v4)().substring(0, 8).toUpperCase()}`;
    const qrData = JSON.stringify({ passportId, userId, verifiedAt: new Date().toISOString() });
    const qrCode = await qrcode_1.default.toDataURL(qrData);
    return BusinessPassport_1.default.findOneAndUpdate({ userId }, {
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
        monthlyRevenue: revenueTrend.map((r) => ({ month: r._id, amount: r.revenue })),
        verificationLevel: user.kycStatus === 'verified' ? 'verified' : 'basic',
        qrCode,
    }, { upsert: true, new: true });
};
exports.generatePassport = generatePassport;
const generateShareableLink = async (userId) => {
    const passport = await BusinessPassport_1.default.findOne({ userId });
    if (!passport)
        throw new appError_1.AppError('Passport not found', 404);
    const link = `https://passport.streetos.ai/verify/${passport.passportId}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await BusinessPassport_1.default.findOneAndUpdate({ userId }, { shareableLink: link, linkExpiresAt: expiresAt });
    return { link, expiresAt };
};
exports.generateShareableLink = generateShareableLink;
//# sourceMappingURL=passport.service.js.map