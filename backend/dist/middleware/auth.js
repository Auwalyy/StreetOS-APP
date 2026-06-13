"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const response_1 = require("../utils/response");
const User_1 = __importDefault(require("../models/User"));
const authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return (0, response_1.sendError)(res, 'Authentication required', 401);
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = (0, jwt_1.verifyAccessToken)(token);
        const user = await User_1.default.findById(payload.sub).select('-passwordHash');
        if (!user || !user.isActive)
            return (0, response_1.sendError)(res, 'User not found or inactive', 401);
        req.user = user;
        next();
    }
    catch {
        return (0, response_1.sendError)(res, 'Invalid or expired token', 401);
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=auth.js.map