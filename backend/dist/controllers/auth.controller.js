"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFCMToken = exports.getMe = exports.logout = exports.refreshToken = exports.resendOTP = exports.verifyOTP = exports.login = exports.register = void 0;
const authService = __importStar(require("../services/auth.service"));
const response_1 = require("../utils/response");
const register = async (req, res) => {
    const result = await authService.registerUser(req.body);
    (0, response_1.sendSuccess)(res, result, 'OTP sent to your phone number', 201);
};
exports.register = register;
const login = async (req, res) => {
    const { phone, password } = req.body;
    const result = await authService.loginUser(phone, password);
    (0, response_1.sendSuccess)(res, result, 'Login successful');
};
exports.login = login;
const verifyOTP = async (req, res) => {
    const { phone, otp } = req.body;
    const result = await authService.verifyUserOTP(phone, otp);
    (0, response_1.sendSuccess)(res, result, 'Phone verified successfully');
};
exports.verifyOTP = verifyOTP;
const resendOTP = async (req, res) => {
    const { phone } = req.body;
    await authService.registerUser({ ...req.body, phone }); // reuses OTP logic
    (0, response_1.sendSuccess)(res, null, 'OTP resent');
};
exports.resendOTP = resendOTP;
const refreshToken = async (req, res) => {
    const { refreshToken } = req.body;
    const tokens = await authService.refreshTokens(refreshToken);
    (0, response_1.sendSuccess)(res, tokens, 'Tokens refreshed');
};
exports.refreshToken = refreshToken;
const logout = async (req, res) => {
    const { refreshToken } = req.body;
    await authService.logoutUser(refreshToken);
    (0, response_1.sendSuccess)(res, null, 'Logged out successfully');
};
exports.logout = logout;
const getMe = async (req, res) => {
    (0, response_1.sendSuccess)(res, req.user, 'User profile');
};
exports.getMe = getMe;
const updateFCMToken = async (req, res) => {
    const { fcmToken } = req.body;
    if (!fcmToken) {
        res.status(400).json({ success: false, message: 'fcmToken required' });
        return;
    }
    await (await Promise.resolve().then(() => __importStar(require('../models/User')))).default.findByIdAndUpdate(req.user._id, { fcmToken });
    (0, response_1.sendSuccess)(res, null, 'FCM token updated');
};
exports.updateFCMToken = updateFCMToken;
//# sourceMappingURL=auth.controller.js.map